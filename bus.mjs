// const fetch = require('node-fetch');
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// const ps = require('prompt-sync');
import ps from 'prompt-sync';
import fetch from "node-fetch";
const prompt = ps();
const API_KEY = "75d6773ad7b647d199cd728959050908";

function getData(){
    const id = prompt("Please specify a Location ID:");
    
    fetch(`https://api.tfl.gov.uk/StopPoint/${id}/Arrivals?api-key=${API_KEY}`)
        .then(response => response.json())
        .then(busses => {
            busses.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation );
            for (const bus of busses){
                console.log(
                    "Bus to " +
                    bus.destinationName +
                    " arriving in around " +
                    Math.floor(bus.timeToStation/60) +
                    " minutes."
                );
            }
        });
    }

// getData();
// retrieve long/lats from Postcode API

async function getStopsByPostcode(){
    const postCode = prompt("Please specify a postcode: ");
    
    const postcodeResponse = await fetch(`http://api.postcodes.io/postcodes/${postCode}`);
    const body = await postcodeResponse.json();
    const longitude = body.result.longitude;
    const latitude = body.result.latitude;
    
    // get closest stops from TFL API using long/lat
    const validStop = [
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
      ]
    
    const joinedTypes = validStop.join(',');
    
    const response = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${latitude}&lon=${longitude}&stopTypes=${joinedTypes}`);
    const busStops = await response.json();
    console.log(busStops);
}
getStopsByPostcode();
