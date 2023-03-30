import brain from 'brain.js';
var net = new brain.NeuralNetwork();
import fs from 'fs';
import mnist from 'mnist';
const set = mnist.set(1000, 0);
const trainingSet = set.training;
net.train(trainingSet,
    {
        errorThresh: 0.005,  // error threshold to reach
        iterations: 20000,   // maximum training iterations
        log: true,           // console.log() progress periodically
        logPeriod: 1,       // number of iterations between logging
        learningRate: 0.3    // learning rate
    }
);

let wstream = fs.createWriteStream('./data/mnistTrain.json');
wstream.write(JSON.stringify(net.toJSON(),null,2));
wstream.end();

console.log('MNIST dataset with Brain.js train done.')