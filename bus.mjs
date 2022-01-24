import ps from 'prompt-sync';
import fetch from "node-fetch";
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const prompt = ps();
const API_KEY = "75d6773ad7b647d199cd728959050908";

async function getStopsByPostcode(){
    let postcodeResponse;
    let body = ''
    const postCode = prompt("Please specify a postcode: ");
    do {
        try {
            postcodeResponse = await fetch(`http://api.postcodes.io/postcodes/${postCode}`);
            body = await postcodeResponse.json();
            if (!body.result){
                throw 'not a valid postcode';
            }
        } catch (err) {
            console.log("Sorry! Invalid postcode");
            logger.error('invalid postcode');
        }
    }
    while (body === false);
    
    const longitude = body.result.longitude;
    const latitude = body.result.latitude;
  
    // get closest stops from TFL API using long/lat
    const validStopTypes = [
        "CarPickupSetDownArea",
        "NaptanAirAccessArea",
        "NaptanAirEntrance",
        "NaptanAirportBuilding",
        "NaptanBusCoachStation",
        "NaptanBusWayPoint",
        "NaptanCoachAccessArea",
        "NaptanCoachBay",
        "NaptanCoachEntrance",
        "NaptanCoachServiceCoverage",
        "NaptanCoachVariableBay",
        "NaptanFerryAccessArea",
        "NaptanFerryBerth",
        "NaptanFerryEntrance",
        "NaptanFerryPort",
        "NaptanFlexibleZone",
        "NaptanHailAndRideSection",
        "NaptanLiftCableCarAccessArea",
        "NaptanLiftCableCarEntrance",
        "NaptanLiftCableCarStop",
        "NaptanLiftCableCarStopArea",
        "NaptanMarkedPoint",
        "NaptanMetroAccessArea",
        "NaptanMetroEntrance",
        "NaptanMetroPlatform",
        "NaptanMetroStation",
        "NaptanOnstreetBusCoachStopCluster",
        "NaptanOnstreetBusCoachStopPair",
        "NaptanPrivateBusCoachTram",
        "NaptanPublicBusCoachTram",
        "NaptanRailAccessArea",
        "NaptanRailEntrance",
        "NaptanRailPlatform",
        "NaptanRailStation",
        "NaptanSharedTaxi",
        "NaptanTaxiRank",
        "NaptanUnmarkedPoint",
        "TransportInterchange"
        ].join(',');
    
    const response = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${latitude}&lon=${longitude}&stopTypes=${validStopTypes}&radius=500`);
    const busStops = await response.json()
    const stops = busStops.stopPoints;
    let validStops = []
    if (stops.length === 0) {
        console.log("Did not return any results.");
    }
    else {
        stops.sort((stop1, stop2) => stop1.distance - stop2.distance);
        for (const stop of stops){
            if (stop.children.length !== 0){
                validStops.push(stop);
                }
            }
        await printNearestStops(validStops, postCode);
        // console.log(stop1,stop2);
        }
}

async function printNearestStops(validStops, postCode){
    console.log('-----------------------');
    console.log('---BUS ARRIVAL TIMES---');
    console.log('-----------------------');
    for (let i=0; i < (validStops.length > 1 ? 2: 1); i++){
        console.log(`${validStops[i].commonName} is ${Math.ceil(validStops[i].distance)}m away.`);
        console.log(`----Buses from ${validStops[i].commonName}----`);
        console.log("-----------------------");
        await printNextArrivalTime(validStops[i].children[0].id);
        console.log("-----------------------");
        await fetchJourney(postCode, validStops[i].children[0].id);
        console.log("-----------------------");

    }
}

async function printNextArrivalTime(id){
    await fetch(`https://api.tfl.gov.uk/StopPoint/${id}/Arrivals?api-key=${API_KEY}`)
        .then(response => response.json())
        .then(busses => {
            busses.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation );
            if (busses.length === 0){
                console.log("There aren't any buses near to you");
            } else { const numOfBuses =  2 || 1;
            for (let i = 0; i<numOfBuses; i++){
                console.log(
                    "Bus to " +
                    busses[i].destinationName +
                    " arriving in around " +
                    Math.floor(busses[i].timeToStation/60) +
                    " minutes."
                );
            }
        }
        });
    }
async function fetchJourney (postCode, naptanId){
    const url = "https://api.tfl.gov.uk/Journey/JourneyResults/"+postCode+"/to/"+naptanId+"?api_key="+API_KEY;
    //https://api.tfl.gov.uk/Journey/JourneyResults/NW51TL/to/490006943N?api_key=4c2ec6355dc441148aedf4a24a48bb8

    let response = await fetch(url);
    let data = await response.json();
    let numberOfWays = data.journeys.length;
    let wayNr=1;
    for (let j in data.journeys) {

        if (numberOfWays>0) {
            console.log ("ROUTE NR "+wayNr.toString());
            wayNr++;
        }
        for (const leg of data.journeys[j].legs) {
            console.log ("SUMMARY: "+leg.instruction.summary);

            if (leg.instruction.steps.length>0) {
                console.log ("STEPS: ");
                for (let st in leg.instruction.steps) {
                    console.log(leg.instruction.steps[st].descriptionHeading+" "+
                        leg.instruction.steps[st].description);
                }
            }
        }
    }
}

function Main(){
    getStopsByPostcode();
}

Main();