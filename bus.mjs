import ps from 'prompt-sync';
import fetch from "node-fetch";
const prompt = ps();
const API_KEY = "75d6773ad7b647d199cd728959050908";

async function getStopsByPostcode(){
    const postCode = prompt("Please specify a postcode: ");
    
    const postcodeResponse = await fetch(`http://api.postcodes.io/postcodes/${postCode}`);
    try {
        const body = await postcodeResponse.json();
    
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
            await printNearestStops(validStops);
            // console.log(stop1,stop2);
            }
        }
    catch (err) {
        console.log("Sorry! Invalid postcode");
        getStopsByPostcode();
    }
}
async function printNearestStops(validStops){
    console.log('-----------------------');
    console.log('---BUS ARRIVAL TIMES---');
    console.log('-----------------------');
    for (let i=0; i < (validStops.length > 1 ? 2: 1); i++){
        console.log(`${validStops[i].commonName} is ${Math.ceil(validStops[i].distance)}m away.`);
        console.log(`----Buses from ${validStops[i].commonName}----`);
        console.log("-----------------------");
        await printNextArrivalTime(validStops[i].children[0].id);
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
    

getStopsByPostcode();