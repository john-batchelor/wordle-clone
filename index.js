const express = require("express");
const app = express();
const port = process.env.PORT || 2312;
const words = require("./data/words");

const actualWord = getWordFromDate();

app.use("/", express.static(__dirname));

app.get("/api/check", (req, res) => {

    var word  = req.query.word;

    var results = evaluateWord(word, actualWord);

    res.send(results);
}); 

function evaluateWord(word, actualWord)
{
    var correct = actualWord == word;

    var results = {};
    if(correct == false)
    {
        var split = word.split("");
        var ac = actualWord.split("");

        for(var i in split)
        {
            var c = split[i];
            

            if(c == ac[i])
            {
                results[c] = "green";
            }
            else if(actualWord.includes(c))
            {
                results[c] = "yellow";
            }
            else{
                results[c] = "grey";
            }
        }
    }

    return {
        correct: correct,
        results: results
    };
}

function getWordFromDate()
{
    var dayOne = new Date(2022, 0, 11);

    var now = new Date();
    
    var Difference_In_Time = now.getTime() - dayOne.getTime();
    
    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    var index = Math.floor(Difference_In_Days);

    
    var allWords = words.words();
    return allWords[index];
}

var server = app.listen(port, () => {
    console.log("Listening on " + port);
});