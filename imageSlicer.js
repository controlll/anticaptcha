import gm from 'gm';
import sharp from 'sharp';
import cv from 'opencv4nodejs';
class imageSlicer{
    constructor(app){
        this.app = app;
        this.gm = gm.subClass({ imageMagick: '7+' });
    }
    imageFilter(url){
        return new Promise((resolve, reject)=>{
            this.gm(url)//.despeckle()
            .modulate(107, 0)
            //.threshold(250)
            .blur(3)
            .modulate(107, 0)
            .contrast(5)
            .blur(1)
            .modulate(115, 100)
            .contrast(5)
            //.threshold(300)
            .toBuffer((err, buffer) => {
              if (err) {
                console.log(err);
                reject(err);
                return;
              }
              resolve(buffer);
            });
        })
    }
    imageFilterTest(buffer){
        return new Promise((resolve, reject)=>{
            this.gm(buffer)
            .blur(10)
            .modulate(150, 0)
            .contrast(5)
            .blur(10)
            .toBuffer((err, buffer) => {
              if (err) {
                reject(err);
                return;
              }
              sharp(buffer)
              //.threshold(100)
              .toBuffer((err, buffer) => {
                if (err) {
                    reject (err);
                    return;
                }
                resolve(buffer);
              });
            });
        })
    }
    async imageSlice(buffer){
        const outputFolder = './numbers';
        let img = cv.imdecode(buffer, cv.IMREAD_GRAYSCALE);//
        cv.imwrite(`${outputFolder}/start_pic.png`, img);
        let pixelmap = img.getDataAsArray().map(row => row.map(val => (val<200?0:255))).reduce((acc, val) => acc.concat(val), []);
        img = new cv.Mat(img.rows, img.cols, cv.CV_8UC1, [0]);
        for (let i = 0; i < img.rows; i++) {
            for (let j = 0; j < img.cols; j++) {
                const brightness = Math.round(pixelmap[i * img.cols + j]);
                img.set(i, j, brightness);
            }
        }
        cv.imwrite(`${outputFolder}/bw_pic.png`, img);
        const binaryImg = img.threshold(0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);
        let contours = binaryImg.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
        for (let i = 0; i < contours.length; i++) {
          const contour = contours[i];
          if (contours[i].hierarchy.z !== -1)
            continue;
          if(contour.getPoints().length < 15)
            continue;
          // создаем маску для объекта
          const mask = new cv.Mat(binaryImg.rows, binaryImg.cols, cv.CV_8UC1, [0]);
          mask.drawContours([contour.getPoints()], 0, new cv.Vec(255, 255, 255), cv.FILLED);
          for(let _contour of contours){
            if (_contour.hierarchy.z === i){
                mask.drawContours([_contour.getPoints()], 0, new cv.Vec(0, 0, 0), cv.FILLED);
            }
          }
          const {x, y, width, height} = contour.boundingRect();
          const cropped = mask.getRegion(new cv.Rect(x, y, width, height));
          contours[i].image = cropped;
        }
        contours.sort((c1, c2) => c1.boundingRect().x - c2.boundingRect().x);
        let fileCounter = 0;
        let images = [];
        for (let j = 0; j < contours.length; j++) {
            if(!contours[j].image)
                continue;
            const fileName = `obj_${fileCounter}.png`;
            const borderWidth = 10;
            // Рисование рамки на исходном изображении
            //contours[j].image.drawRectangle(pt1, pt2, new cv.Vec3(0, 0, 0), 10);
            contours[j].image = contours[j].image.copyMakeBorder(borderWidth, borderWidth, borderWidth, borderWidth);
            contours[j].image = contours[j].image.resize(28, 28);
            //cv.imwrite(`${outputFolder}/${fileName}`, contours[j].image);
           /* contours[j].image = contours[j].image.resize(512, 512);
            contours[j].image = cv.imdecode(await this.imageFilterTest(cv.imencode('.png', contours[j].image)), cv.IMREAD_GRAYSCALE);
            contours[j].image = contours[j].image.resize(28, 28);*/
            images[fileCounter] = contours[j].image.getDataAsArray().map(row => row.map(val => val/255)).reduce((acc, val) => acc.concat(val), []);
          
            let img2 = new cv.Mat(28, 28, cv.CV_8UC1, [0]);
            // Заполняем изображение пикселями в соответствии с массивом
            for (let i = 0; i < 28; i++) {
                for (let j = 0; j < 28; j++) {
                    const brightness = Math.round(images[fileCounter][i * 28 + j] * 255);
                    img2.set(i, j, brightness);
                }
            }
            // Сохраняем изображение
            cv.imwrite(`${outputFolder}/${fileName}`, img2);
            
            fileCounter++;
        }
        if(images.length != 6)
            return false;
        return images;
    }
}
export default imageSlicer;