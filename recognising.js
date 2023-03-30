import brain from 'brain.js';
import fs from 'fs';

class recognising{
    constructor(){
        this.net = new brain.NeuralNetwork();
        this.net.fromJSON(JSON.parse(fs.readFileSync('./data/my_train.json')));
    }
    soft(output){
        var maximum = output.reduce(function(p,c) { return p>c ? p : c; });
        var nominators = output.map(function(e) { return Math.exp(e - maximum); });
        var denominator = nominators.reduce(function (p, c) { return p + c; });
        var softmax = nominators.map(function(e) { return e / denominator; });
        var maxIndex = 0;
        softmax.reduce(function(p,c,i){if(p<c) {maxIndex=i; return c;} else return p;});
        for (var i=0; i<output.length; i++)
        {
            if (i==maxIndex)
                return i;
        }
        return false;
    }
    train(data){
        this.net.train(data, {errorThresh: 0.002,  // error threshold to reach
            iterations: 20000,   // maximum training iterations
            log: true,           // console.log() progress periodically
            logPeriod: 1,       // number of iterations between logging
            learningRate: 0.3    // learning rate
        });
        let wstream = fs.createWriteStream('./data/my_train.json');
        wstream.write(JSON.stringify(this.net.toJSON(),null,2));
        wstream.end();
        console.log('сохранили');
    }
    getNumber(buffer){
        var output = this.net.run(buffer);
        console.log(output);
        return this.soft(output);
    }
}
export default recognising;