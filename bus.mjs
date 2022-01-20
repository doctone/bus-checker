// const fetch = require('node-fetch');
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// const ps = require('prompt-sync');
import ps from 'prompt-sync';
import fetch from "node-fetch";
const prompt = ps();
const API_KEY = "75d6773ad7b647d199cd728959050908";

async function getLongAndLatFromPostcode(){
    let longLat = [];
    const postCode = prompt("Please specify a postcode: ");
    fetch(`http://api.postcodes.io/postcodes/${postCode}`)
    .then(response => response.json())
    .then(body => {
        const longitude = await body.result.longitude;
        const latitude = await body.result.latitude;
        console.log(postCodeLatitude, postCodeLongitude);
        longLat.push(postCodeLatitude);
        longLat.push(postCodeLongitude);
        return longLat;
        // findBusStops(latitude, longitude);
    });
}
console.log(getLongAndLatFromPostcode());

function findBusStops(lat, lon){
    fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lon}&stopTypes=NaptanPublicBusCoachTram`)
        .then(response => response.json())
        .then(body => {
            
        });
    }
// getData();
// getLongAndLatFromPostcode();
// not finding any bus stops near