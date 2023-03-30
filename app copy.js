import brain from 'brain.js';
const config = {
    binaryThresh: 0.5,
    hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
    activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
    leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
  };
  
  // create a simple feed forward neural network with backpropagation
  const net = new brain.NeuralNetwork(config);
  
  net.train([
    { input: [0, 0], output: [0] },
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [1, 1], output: [0] },
  ]);
  
  const output = net.run([1, 0]); // [0.987]

  console.log(output);

  import gm from 'gm';
  import fs from 'fs';

  let test = gm.subClass({ imageMagick: '7+' });
  /*test("CodeImage.jpg").despeckle().write('D:/rabota/nodejs/anticaptcha/test.png', function (err) {
    console.log(err);
    if (!err) console.log('done');
  });*/
  import sharp from 'sharp';



  test("D:/rabota/nodejs/anticaptcha/CodeImage.jpg").despeckle()
  .blur(3)
  //.contrast(5)
  .modulate(110, 0)
  .contrast(5)
  .blur(5)
  .modulate(120, 0)
  .contrast(5)
  .toBuffer((err, buffer) => {
    if (err) {
      console.error(err);
      return;
    }
  
    // Используем sharp для обработки изображения
    sharp(buffer)
    .threshold(175)
    .removeAlpha()
  .flatten()
  .trim()
    // Сохранить результат
    .toFile('D:/rabota/nodejs/anticaptcha/test2.jpg', (err, info) => {
      if (err) throw err;
      console.log(info);
    });
  });
