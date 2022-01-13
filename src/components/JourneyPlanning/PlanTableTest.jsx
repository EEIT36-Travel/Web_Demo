import React, { useState, useEffect } from 'react';
import { DirectionsService, LoadScript } from '@react-google-maps/api';
var temp = [];
var beginDate;
var respone;
var jsondata;
var post=true;//if true click button to post data else,put data 
var singleTitle="";//one item event
var lastplace;
function PlanTableTest({setResault,place}) {
    const [data, setData] = useState([])
     console.log("LOAD")
     function FetchData(journeyid) {
         //get資料庫已有行程
        fetch("http://localhost:8080/journey/"+journeyid)
            .then((res) => {
               return res.json();
            }).then((jsondata) => {
                dataparse(jsondata)
                console.log(jsondata)
                window.localStorage.jsondata = JSON.stringify(jsondata)
            })
    }
     if(window.localStorage.jsondata/*檢查local storge*/ ){
        jsondata = JSON.parse(window.localStorage.jsondata)
        console.log("------------------------")
        jsondata.journeydetail = JSON.parse(jsondata.journeydetail)
        if(lastplace!=place.place_id &&  place.place_id ){
            lastplace=place.place_id;
            jsondata.journeydetail.eachDays[0].eachPlaces.push({"placeName":place.place_name,"AttractionsId":place.place_id})
            localStore(jsondata);
            console.log("insert")
            dataparse(jsondata)
        }       
       
    }else{//如果local storge 沒東西放一個 journey detail 格式的json進去
       let josonmodel ={};
        josonmodel.journeydetail={}
        josonmodel.journeydetail.beginDate="2021-02-15"
        josonmodel.journeydetail.daysNum=2
        josonmodel.journeydetail.eachDays=[];
       
        let placeobject ={};
        placeobject.beginTime = "0900"
        placeobject.placesNum = "2"
        placeobject.eachPlaces=[];
        josonmodel.journeydetail.eachDays.push(placeobject)
        localStore(josonmodel);
    }
    useEffect(()=>{
        //dataparse(jsondata)
    },[])
    
    function localStore(jsondata){
        jsondata.journeydetail= JSON.stringify(jsondata.journeydetail)//為了要journeybean 對照到detail是string
        window.localStorage.jsondata= JSON.stringify(jsondata);
    }

    function dataparse(jsondata) {
        temp = JSON.parse(jsondata.journeydetail).eachDays[0].eachPlaces; //暫存區放eachplace array
        if(temp.length===1){
            singleTitle = temp[0].placeName
            setData(temp); //只有一個物件時繪製journetplan用
        }
        beginDate = JSON.parse(jsondata.journeydetail).beginDate;
        let count = 0;
        for (var i = 0; i < temp.length - 1; i++) {
            singleTitle="";
            let continute = FetchDistance(temp[i].AttractionsId, temp[i + 1].AttractionsId, temp[i]);//取陣列送資料給derection算距離
            continute.then(() => {
                count++;
                if (count == temp.length - 1) {
                   
                    setData(temp);                   
                    console.log("DRAW TABLE")
                }
            });
        }
        
    }
    async function FetchDistance(startID, endId, temp) {
        return await fetch(`/maps/api/distancematrix/json?origins=place_id:${startID}&destinations=place_id:${endId}&key=AIzaSyAyzMJTILn9Et7hkWpxfA3jyOdILF7zCig`)
            .then((res) => {
                return res.json();
            }).then((jsondata) => {
                let result = {};
                let data = jsondata.rows[0].elements[0];
                result.distanceText = data.distance.text;
                result.distanceValue = data.distance.value;
                result.durationText = data.duration.text;
                result.durationValue = data.duration.value;
                temp.distance = `距離:${result.distanceText} 時間:${result.durationText}`;//距離結果存回temp方便畫plan table
                return true;
            })
    }

    function makeWayPoint(data) {
        let waypoit = [];
        for (let i = 1; i < data.length - 1; i++) {
            let temp = {};
            temp.location = {}
            temp.location.placeId = data[i].AttractionsId
            waypoit[i-1] = temp;
        }
        console.log(waypoit);
        return waypoit;
    }


    function saveData() {
        if(post){
            fetch("http://localhost:8080/journey/2", {
                method: 'POST', 
                body: window.localStorage.jsondata, 
                headers: new Headers({
                  'Content-Type': 'application/json'
                })
              }).then((res )=>{  return res.json() })
                
              .catch(error => alert(error) )
              .then(response =>{          
                FetchData(response.journeyid) //post後從資料庫拿新資料 轉換成編輯已有行程狀態
                post = false;
              });
        }else{
            fetch("http://localhost:8080/journey/", {//update
                method: 'PUT', 
                body: window.localStorage.jsondata, 
                headers: new Headers({
                  'Content-Type': 'application/json'
                })
              }).then((res )=>{  return res.json() })               
              .catch(error => console.log(error) )
              .then(response =>{
                console.log(response)
              });
        }

    }
    
    function deleteItem(e){ //delete event      
        jsondata = JSON.parse(window.localStorage.jsondata)
        jsondata.journeydetail = JSON.parse(jsondata.journeydetail)
        jsondata.journeydetail.eachDays[0].eachPlaces.splice(parseInt(e.target.id.substr(6,1)),1);
        jsondata.journeydetail= JSON.stringify(jsondata.journeydetail)
        window.localStorage.jsondata= JSON.stringify(jsondata);
        dataparse(jsondata)
    }

    function setMap() {
        setResault(respone)
        console.log("draw map")
    }
    return (<div>{
        <DirectionsService options={{
            destination: { placeId: (data.length > 0) ? data[data.length - 1].AttractionsId : null },
            origin: { placeId: (data.length > 0) ? data[0].AttractionsId : null },
            waypoints: (data.length > 0) ? makeWayPoint(data) : [{ location: null }],
            travelMode: "DRIVING"
        }}
            callback={(res) => {
                respone = res;
                console.log("callback")              
             }}>

        </DirectionsService>
    }
        <table >
            <tr>
                <th><input type="date" value={beginDate} ></input></th>
            </tr>
            {(singleTitle=="")?"":<tr><b>{singleTitle}</b><button id={`delbtn0`} className='delbutton'>刪除</button></tr>}
            
            {data.map((item,idex) => {
                return <><tr><td><b>{item.placeName}</b><button id={`delbtn${idex}`} className='delbutton' onClick={deleteItem}>刪除</button></td></tr><tr>{item.distance}</tr></>
            })}</table><button onClick={setMap}>MAP</button><br/><button onClick={saveData}>儲存</button>
    </div>)
}

export default PlanTableTest;
