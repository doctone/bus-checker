// const fetch = require('node-fetch');
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// const ps = require('prompt-sync');
import ps from 'prompt-sync';
import fetch from "node-fetch";
const prompt = ps();

function getData(){
    const API_KEY = "75d6773ad7b647d199cd728959050908";
    const id = prompt("Please specify a Location ID:");
    
    fetch(`https://api.tfl.gov.uk/StopPoint/${id}/Arrivals?api-key=${API_KEY}`)
        .then(response => response.json())
        .then(body => {
            for (let i=0; i<5; i++){
            console.log(body[i]);
                }
            });
}

getData();