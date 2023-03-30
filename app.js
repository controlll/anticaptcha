import imageSlicer from "./imageSlicer.js";
import fs from 'fs';
import recognising from "./recognising.js";
setInterval(()=>{}, 100);
class app{
  constructor(){
    this.imageSlicer = new imageSlicer(this);
    this.recognising = new recognising();
    //let trainData = JSON.parse(fs.readFileSync('./data/my_train_data.json'));//если надо перетренеровать по массиву данных
    //this.recognising.train(trainData);
    this.getCaptcha();
  }
  async getCaptcha(){
    let buffer = await this.imageSlicer.imageFilter("./CodeImage.jpg");
    let buffers = await this.imageSlicer.imageSlice(buffer);
    if(buffers == false)
      return console.log('error captcha');
    let i = 0;
    let result = '';
    for(let buf of buffers){
      let res = this.recognising.getNumber(buf);
      result += String(res);
      i++;
    }
    console.log("Капча:",result);
  }

  async getCaptchaPlusTrain(){//это чтобы тренеровать вручную
    let captcha = '235697';//это ответ на капчу
    let saveDataAndTrain = true;//если true, то сохраняем данные и дотренеровываем модель. Если капча сложная попалась, она может хуёво разрезаться.
    let buffer = await this.imageSlicer.imageFilter('./CodeImage.jpg');//это капча из файлов
    let buffers = await this.imageSlicer.imageSlice(buffer);

    console.log(buffers);
    if(buffers == false)
      return console.log('error captcha');
    let i = 0;
    let trainData = JSON.parse(fs.readFileSync('./data/my_train_data.json'));
    fs.copyFileSync('./data/my_train_data.json', './data/my_train_data_backup.json');
    
    let result = '';
    for(let buf of buffers){
      let output = [0,0,0,0,0,0,0,0,0,0];
      output[captcha[i]] = 1;
      trainData.push({input: buf, output: output});
      let res = this.recognising.getNumber(buf);
      //console.log(i, res);
      result += String(res);
      i++;
    }
    console.log("Капча:",result);


    if(result == captcha){
      console.log('Капчу отгадали!', result);
    }
    //console.log(trainData);
    if(saveDataAndTrain){
      let wstream = fs.createWriteStream('./data/my_train_data.json');
      wstream.write(JSON.stringify(trainData));
      wstream.end();
      this.recognising.train(trainData);
    }
  }
}
new app();