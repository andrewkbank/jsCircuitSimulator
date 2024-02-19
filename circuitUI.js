

class Point {
    constructor(x=0, y=0) {
        this.x = Number(x);
        this.y = Number(y);
    }
    roundTo(val = 10){
        let x = Math.round(this.x/val)*val;
        let y = Math.round(this.y/val)*val;
        return new Point(x,y);
    }
    add(x,y=0){
        if (x instanceof Point) {
            y = x.y;
            x = x.x;
        }
        return new Point(this.x + x, this.y + y);
    }
    addi(x,y=0){
        if (x instanceof Point) {
            y = x.y;
            x = x.x;
        }
        this.x += x;
        this.y += y;
        return this;
    }
    sub(x,y=0){
        if (x instanceof Point) {
            y = x.y;
            x = x.x;
        }
        return new Point(this.x - x, this.y - y);
    }
    subi(x,y=0){
        if (x instanceof Point) {
            y = x.y;
            x = x.x;
        }
        this.x -= x;
        this.y -= y;
        return this;
    }
    set(x,y=0){
        if (x instanceof Point){
            this.x = x.x;
            this.y = x.y;
            return;
        }
        this.x = x;
        this.y = y;
    }
    lockTo(segPoint1,segPoint2){    //locks a point to be on a line perpendicular to line segment that goes through segPoint1
        //all parameters are points
        if(!segPoint1 instanceof Point && !segPoint2 instanceof Point){ return;}
        //find the intersection between 2 lines:
        //line 1
        //(y-segPoint1.y)=-1*(segPoint2.x-segPoint1.x)/(segPoint2.y-segPoint1.y)*(x-segPoint1.x)
        const slope1 = -1*(segPoint2.x-segPoint1.x)/(segPoint2.y-segPoint1.y);
        const yIntercept1 = segPoint1.y-slope1*segPoint1.x;
        //line 2
        //(y-this.y)=(segPoint2.y-segPoint1.y)/(segPoint2.x-segPoint1.x)*(x-this.x)
        const slope2 = (segPoint2.y-segPoint1.y)/(segPoint2.x-segPoint1.x);
        const yIntercept2 = this.y-slope2*this.x;

        this.x=(yIntercept2 - yIntercept1) / (slope1 - slope2);
        this.y=slope1 * this.x + yIntercept1;
    }
    getHashCode(){
        return Math.floor(this.x)*10000 + this.y;
    }
    fromHashCode(hash, roundTo=1){
        this.x = hash/10000;
        this.y = hash%10000;
        return this;
    }

    copy(){return new Point(this.x, this.y);}

    equalTo(x,y) {
        if (x instanceof Point){
            y = x.y;
            x = x.x;
        }
        if (x == this.x && y == this.y){
            return true;
        }
        return false;
    }
    dx(x){
        if (x instanceof Point){
            x=x.x
        }
        return this.x-x;
    }
    dy(y){
        if(y instanceof Point){
            y=y.y;
        }
        return this.y-y;
    }
    distTo(x,y) {
        if (x instanceof Point){
            y = x.y;
            x = x.x;
        }
        return Math.sqrt( Math.pow(this.x-x, 2) + Math.pow(this.y-y, 2) );
    }
    midpoint(x,y){
        if(x instanceof Point){
            y = x.y;
            x = x.x;
        }
        return new Point((this.x+x)/2,(this.y+y)/2);
    }
}


function styleFromVoltage(voltage, multiplier=25){
    voltage = Number(voltage);
    if (isNaN(voltage)){
        return "rgb(0,0,0)";
    }
    return "rgb("+Math.round(Math.min(Math.max(0,-multiplier*voltage), 150))+","+Math.round(Math.min(Math.max(0,multiplier*voltage), 150))+",0)";
}

function renderWire(ctx, componentWidth, startPoint, endPoint, value,){
    //ctx.strokeStyle = styleFromVoltage(voltageN1);
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    const w = componentWidth/4;
    //const r = Math.max(0,Math.round(-value*25));
    //const g = Math.max(0,Math.round(value*25));
    //ctx.fillStyle = 'rgb('+r+","+g+",0)";
    //console.log(ctx.fillStyle);
    //ctx.fillRect(startPoint.x-w, startPoint.y-w, 2*w,2*w)
    //ctx.fillRect(endPoint.x-w, endPoint.y-w, 2*w,2*w)
    ctx.stroke();
    ctx.closePath();
}

function renderResistor(ctx, componentWidth, startPoint, endPoint, value, compSimulationData){
    const startVoltage = compSimulationData.startNodeVoltage;
    const endVoltage = compSimulationData.endNodeVoltage;
    const currentAcross = compSimulationData.current;
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const length = Math.sqrt( Math.pow(endPoint.x-startPoint.x, 2) + Math.pow(endPoint.y-startPoint.y,2) );
    let rotAngle = angle;                
    
    /*
    //this is code that displays the nodal voltages. it isn't great here
    if(!isNaN(startVoltage))
        ctx.fillText(startVoltage.toFixed(3)+" V",startPoint.x,startPoint.y-10);
    if(!isNaN(endVoltage))
        ctx.fillText(endVoltage.toFixed(3)+" V",endPoint.x,endPoint.y-10);
    */
    if (rotAngle < 0){  rotAngle += Math.PI*2;  }
    if (rotAngle < Math.PI/2 || rotAngle >= 3*Math.PI/2){   rotAngle = angle;
    } else {    rotAngle = angle+Math.PI;   }

    //ctx.fillStyle = 'rgb(0,0,0)';
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate((startPoint.x+endPoint.x)/2, (startPoint.y+endPoint.y)/2);
    ctx.rotate(rotAngle);
    //console.log(sVoltage, eVoltage, avgVoltage, styleFromVoltage(sVoltage), styleFromVoltage(eVoltage));

    ctx.beginPath();
    //ctx.strokeStyle = styleFromVoltage(sVoltage);
    ctx.moveTo(-length/2, 0);
    ctx.lineTo(-componentWidth, 0); //straight part
    ctx.stroke();

    const height = componentWidth*0.5;
    ctx.beginPath();
    //ctx.strokeStyle = styleFromVoltage(voltageAcross);
    ctx.moveTo( -componentWidth, 0);//now squiggles
    ctx.lineTo( -componentWidth*0.75,  height);
    ctx.lineTo( -componentWidth*0.25, -height);
    ctx.lineTo(  componentWidth*0.25,  height);
    ctx.lineTo(  componentWidth*0.75, -height);
    ctx.lineTo(       componentWidth,       0);
    ctx.stroke();

    ctx.beginPath();
    //ctx.strokeStyle = styleFromVoltage(eVoltage);
    ctx.moveTo(       componentWidth,       0);
    ctx.lineTo(length/2, 0); //other straight part
    ctx.stroke();

    //Display current across the resistor
    if(!isNaN(currentAcross))
        ctx.fillText(Math.abs((currentAcross).toFixed(3))+" mA",0,height*3);
    //might have to figure out a way besides multiplying by 1000 to display in mA

    //Displays the resistance
    ctx.fillText(value, 0,-height*1.2  );
    ctx.restore();

    let w = componentWidth/4;
    ctx.fillRect(startPoint.x-w, startPoint.y-w, 2*w,2*w)
    ctx.fillRect(endPoint.x-w, endPoint.y-w, 2*w,2*w)
}

function renderCapacitor(ctx, componentWidth, startPoint, endPoint, value, compSimulationData){
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const length = Math.sqrt( Math.pow(endPoint.x-startPoint.x, 2) + Math.pow(endPoint.y-startPoint.y,2) );

    let rotAngle = angle;                
                
    if (rotAngle < 0){  rotAngle += Math.PI*2;  }
    if (rotAngle < Math.PI/2 || rotAngle >= 3*Math.PI/2){   rotAngle = angle;
    } else {    rotAngle = angle+Math.PI;   }
    
    const eVoltage = compSimulationData.startNodeVoltage;
    const sVoltage = compSimulationData.endNodeVoltage;
    const width = componentWidth/3;

    ctx.textAlign = "center";
    ctx.save();
    ctx.translate((startPoint.x+endPoint.x)/2, (startPoint.y+endPoint.y)/2);
    ctx.rotate(rotAngle);

    ctx.beginPath();
    //ctx.strokeStyle = styleFromVoltage(sVoltage);
    ctx.fillStyle = ctx.strokeStyle;
    //ctx.fillRect(startPoint.x-w, startPoint.y-w, 2*w,2*w)
    ctx.moveTo(-length/2, 0);
    ctx.lineTo(-width, 0); //straight part
    ctx.moveTo(-width, componentWidth); 
    ctx.lineTo(-width, -componentWidth); //first side
    ctx.stroke();

    ctx.beginPath();
    //ctx.strokeStyle = styleFromVoltage(eVoltage);
    ctx.moveTo(width, componentWidth); 
    ctx.lineTo(width, -componentWidth); //second side
    ctx.moveTo(width, 0);
    ctx.lineTo(length/2, 0); //straight part
    ctx.stroke();
    
    ctx.fillText(value, 0,-componentWidth*1.1  );
    ctx.restore();

    let w = componentWidth/4;
    //ctx.fillRect(startPoint.x-w, startPoint.y-w, 2*w,2*w)
    //ctx.fillRect(endPoint.x-w, endPoint.y-w, 2*w,2*w)
    ctx.closePath();

}

function renderInductor(ctx, componentWidth, startPoint, endPoint, value){
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const length = Math.sqrt( Math.pow(endPoint.x-startPoint.x, 2) + Math.pow(endPoint.y-startPoint.y,2) );
    
    let rotAngle = angle;                
                
    if (rotAngle < 0){ rotAngle += Math.PI*2;   }
    if (rotAngle < Math.PI/2 || rotAngle >= 3*Math.PI/2){   rotAngle = angle;
    } else { rotAngle = angle+Math.PI;  }
    
    ctx.beginPath();
    //ctx.fillStyle = 'rgb(0,0,0)';
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate((startPoint.x+endPoint.x)/2, (startPoint.y+endPoint.y)/2);
    ctx.rotate(rotAngle);

    ctx.moveTo(-length/2, 0);
    ctx.lineTo(-componentWidth, 0); //straight part
    ctx.moveTo(-componentWidth*0.5, 0);
    ctx.arc(-componentWidth*0.75, 0, componentWidth/4, 0, Math.PI);
    ctx.moveTo(0, 0);
    ctx.arc(-componentWidth*0.25, 0, componentWidth/4, 0, Math.PI);
    ctx.moveTo(componentWidth*0.5, 0);
    ctx.arc( componentWidth*0.25, 0, componentWidth/4, 0, Math.PI);
    ctx.moveTo( componentWidth, 0);
    ctx.arc( componentWidth*0.75, 0, componentWidth/4, 0, Math.PI);
    ctx.moveTo( componentWidth, 0);
    ctx.lineTo(length/2,0);
    //ctx.moveTo(length/2,0);
    /*
    const height = componentWidth*0.5;
    //now squiggles
    ctx.lineTo( -componentWidth*0.75,  height);
    ctx.lineTo( -componentWidth*0.25, -height);
    ctx.lineTo(  componentWidth*0.25,  height);
    ctx.lineTo(  componentWidth*0.75, -height);
    ctx.lineTo(       componentWidth,       0);
    */
    //ctx.moveTo(100, 0);
    //ctx.lineTo(length/2, 0); //other straight part
    ctx.stroke();

    ctx.fillText(value, 0,-componentWidth*0.5*1.2  );
    ctx.restore();

    let w = componentWidth/4;
    ctx.fillRect(startPoint.x-w, startPoint.y-w, 2*w,2*w)
    ctx.fillRect(endPoint.x-w, endPoint.y-w, 2*w,2*w)

    ctx.closePath();
}

function renderVoltage2n(ctx, componentWidth, startPoint, endPoint, value){
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const length = Math.sqrt( Math.pow(endPoint.x-startPoint.x, 2) + Math.pow(endPoint.y-startPoint.y,2) );

    let rotAngle = angle;                           
    if (rotAngle < 0){  rotAngle += Math.PI*2;}
    if (rotAngle < Math.PI/2 || rotAngle >= 3*Math.PI/2){   rotAngle = angle;
    } else {    rotAngle = angle+Math.PI;   }
    
    ctx.beginPath();

    ctx.textAlign = "center";
    ctx.save();
    ctx.translate((startPoint.x+endPoint.x)/2, (startPoint.y+endPoint.y)/2);
    ctx.rotate(angle);

    const width = componentWidth/3;
    ctx.moveTo(-length/2, 0);
    ctx.lineTo(-width, 0); //straight part
    ctx.moveTo(-width, componentWidth/2); 
    ctx.lineTo(-width, -componentWidth/2); //first side

    ctx.moveTo(width, componentWidth); 
    ctx.lineTo(width, -componentWidth); //second side

    ctx.moveTo(width, 0);
    ctx.lineTo(length/2, 0); //straight part

    ctx.stroke();

    //voltage value (make sure it isn't upside down)
    ctx.rotate(rotAngle-angle);
    ctx.fillText(value, 0,-componentWidth*1.1  );
    ctx.restore();

    //what is this rectangle?
    let w = componentWidth/4;
    ctx.fillRect(startPoint.x-w, startPoint.y-w, 2*w,2*w)
    ctx.fillRect(endPoint.x-w, endPoint.y-w, 2*w,2*w)

    ctx.closePath();
}

function renderVoltage1n(ctx, componentWidth, startPoint, endPoint, value){
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);

    ctx.fillText(value, endPoint.x + Math.cos(angle)*componentWidth, endPoint.y + Math.sin(angle)*componentWidth);
    ctx.stroke();
    let w = componentWidth/4;
    ctx.fillRect(startPoint.x-w, startPoint.y-w, 2*w,2*w)
    ctx.closePath();
}

function renderDiode(ctx, componentWidth, startPoint, endPoint, value){
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const length = Math.sqrt( Math.pow(endPoint.x-startPoint.x, 2) + Math.pow(endPoint.y-startPoint.y,2) );

    let rotAngle = angle;                
    
    ctx.beginPath();

    ctx.textAlign = "center";
    ctx.save();
    ctx.translate((startPoint.x+endPoint.x)/2, (startPoint.y+endPoint.y)/2);
    ctx.rotate(rotAngle);

    const width = componentWidth/3;
    ctx.moveTo(-length/2, 0);
    ctx.lineTo(-width, 0); //straight part


    ctx.moveTo(-width, componentWidth/2); 
    ctx.lineTo(-width, -componentWidth/2); //triangle
    ctx.lineTo(width, 0); 
    ctx.lineTo(-width, componentWidth/2); 

    ctx.moveTo(width, componentWidth/2); 
    ctx.lineTo(width, -componentWidth/2); //second side

    ctx.moveTo(width, 0);
    ctx.lineTo(length/2, 0); //straight part

    ctx.stroke();

    //ctx.fillText(value, 0,-componentWidth*1.1  );
    ctx.restore();

    let w = componentWidth/4;
    ctx.fillRect(startPoint.x-w, startPoint.y-w, 2*w,2*w)
    ctx.fillRect(endPoint.x-w, endPoint.y-w, 2*w,2*w)

    ctx.closePath();
}

function updateDropdown(n) {
    var menu = document.getElementById("menu");
    var ohmsLawOption = document.createElement("option");
    var kirchhoffsLawsOption = document.createElement("option");
    var nodalOption = document.createElement("option");
    var meshOption = document.createElement("option");

    ohmsLawOption.value = "Ohm";
    ohmsLawOption.text = "Ohm's Law";
    kirchhoffsLawsOption.value = "Equivalent";
    kirchhoffsLawsOption.text = "Equivalent Circuits";
    nodalOption.value = "Nodal";
    nodalOption.text = "Nodal Analysis";
    meshOption.value = "Mesh";
    meshOption.text = "Mesh Analysis";

    // Clear existing options
    while (menu.options.length > 1) {
      menu.remove(1);
    }
    
    // Add options based on n
    if (n === 2) {
      menu.add(ohmsLawOption);
    } else if (n === 3) {
      menu.add(kirchhoffsLawsOption);
    }
    menu.add(nodalOption);
    menu.add(meshOption);
  }

  //this function opens a popup for matrix entry
  //its kinda big because it contains all the html code for the popup
  function openPopup(matrixSize,nodal=true) {
    let char = 'V';
    if(!nodal)
        char = 'I';
    // Open a popup window with specified dimensions
    let popupWindow = window.open('', 'popupWindow', 'width=400,height=200');
    
    // Write HTML content to the popup window
    let htmlString=`
    <html>
    <head>
        <title>Matrix entry</title>
    </head>
        <style>
            /* General style for all text inputs */
            .textInput {
                width: 50px;
                margin-bottom: 20px; /* Optional: Adds some spacing between text inputs */
            }
            .gridContainer {
                display: grid;
                grid-template-columns: auto auto auto;
                grid-gap: 5px; /* Adjust the value to control the amount of space */
            }`
    //we write the grid layout for every element
    for(let i=0;i<matrixSize;++i){
        //matrix
        for(let j=0;j<matrixSize;++j){
            htmlString+=`.textInput`+String(i)+String(j)+`{
                grid-row: `+String(i+1)+`;
                grid-column: `+String(j+1)+`;
            }`;
        }
        //V1-V99 vector
        htmlString+=`.V`+String(i)+`{
            grid-row: `+String(i+1)+`;
            grid-column: `+String(matrixSize+1)+`;
        }`;
        //right side
        htmlString+=`.textInput`+String(i)+`{
            grid-row: `+String(i+1)+`;
            grid-column: `+String(matrixSize+3)+`;
        }`;
    }
    htmlString+=`</style>
    <body>
        <form id="myForm">
            <label>Enter Matrix:</label>
            <br>
            <div class="gridContainer">`;
    //console.log("matrixSize",matrixSize);
    for(let i=0;i<matrixSize;++i){
        //matrix
        for(let j=0;j<matrixSize;++j){
            htmlString+=`<div class="textInput`+String(i)+String(j)+`"><input type="text" class="textInput" id="textInput`+String(i)+String(j)+`" /></div>`
        }
        //V1-V99 vector (or I1-I99)
        htmlString+=`<div class="`+char+String(i)+`"><label> `+char+String(i+1)+`</label></div>`;
        //right side
        htmlString+=`<div class="textInput`+String(i)+`"><input type="text" class="textInput" id="textInput`+String(i)+`" /></div>`
    }
    htmlString+=`
        </div> 
        <br>
        <button type="button" onclick="yeet()">Submit</button>
    </form>
    <script>
        window.onbeforeunload = function() {
            window.opener.postMessage(document.getElementById('textInput').value, '*');
        };

        function yeet() {
            let matrixinfo = [];
            for(let i=0;i<`+String(matrixSize)+`;++i){
                for(let j=0;j<`+String(matrixSize)+`;++j){
                    matrixinfo.push(document.getElementById('textInput'+String(i)+String(j)).value);
                }
                matrixinfo.push(document.getElementById('textInput'+String(i)).value);
            }
            window.opener.postMessage(matrixinfo,'*');

            //window.close();
        }
    </script>
    </body>
    </html>`
    
    popupWindow.document.write(htmlString);
  }
  function closePopup(){
    let popupWindow = window.open('', 'popupWindow', 'width=400,height=200');
    popupWindow.close();
  }

  function isBetween(i, j, k) {
    return (i >= j && i <= k) || (i >= k && i <= j);
  }
  
  function isLoop(componentList){
    //checks if componentList is a loop
    let nodeList=[];
    let empty=true;
    //note: we could either compare node names or node points
    //I've chosen to go with names since some parallel line components are hard to select (which is needed to select all the points of a loop)
    for(let i=0;i<componentList.length;++i){
        //add unique node names to the node lists
        //and remove duplicate node names
        if(componentList[i].type=="wire") continue;
        empty=false;
        if(nodeList.includes(componentList[i].startNodeName)){
            nodeList.splice(nodeList.indexOf(componentList[i].startNodeName),1);
        }else{
            nodeList.push(componentList[i].startNodeName);
        }
        if(nodeList.includes(componentList[i].endNodeName)){
            nodeList.splice(nodeList.indexOf(componentList[i].endNodeName),1);
        }else{
            nodeList.push(componentList[i].endNodeName);
        }
    }
    return (nodeList.length===0&&!empty);
  }

  function midPoint(components){
    //shoutouts to Jarvis for this one
    if (components.length === 0) {
        return null; // Handle the case where the array is empty
    }
    const centroid = new Point(0,0);

    // Calculate the sum of each dimension
    for (const component of components) {
        centroid.addi(component.startPoint);
        //if endpoint is a distinct point from startpoint
        centroid.addi(component.endPoint);
    }

    // Calculate the average for each dimension
    centroid.x /= components.length*2;
    centroid.y /= components.length*2;

    return centroid;
  }

  function distanceFromMidpoint(centroid, components){
    let sum = 0;
    for(let i=0;i<components.length;++i){
        sum+=centroid.distTo(components[i].startPoint);
        sum+=centroid.distTo(components[i].endPoint);
    }
    sum/=components.length*2;
    return sum
  }

//For each save we do: type, sp.x, sp.y, ep.x, ep.y, valueString,
class UIComponent{
    constructor(type="wire", startPoint=new Point(), endPoint=new Point(100,100), value, name=""){
        if (type != null && type.length > 1){   type.toLowerCase(); }

        //allowable types: wire,w, resistor,r, capacitor,c, inductor,i, currentSource,cs, v,voltage2n,v2n, voltage1n,v1n,V,
        this.type = type;
        if(name==""){
            this.name = this.type[0] + Math.round(Math.random()*1000);
        }else{
            this.name = name;
        }
        this.startPoint = startPoint; //of type Point, in canvas coordinates
        this.endPoint = endPoint;

        this.startNodeName = "";
        this.endNodeName = "";

        this.voltageData = []; //used for plotting...
        this.currentData = [];
        this.voltageMultiplier = 100;
        this.currentMultiplier = 100;
        this.plotTimeDivisor = 5; //for speeding up...

        this.renderFunction = renderWire;
        let tempVal = '1';
        switch (type){
            case "r": 
            case "resistor": this.renderFunction = renderResistor; tempVal = '1k'; break;
            case "c": 
            case "capacitor": this.renderFunction = renderCapacitor;  tempVal = '1u'; break;
            case "v": 
            case "v2n":
            case "voltage2n": this.renderFunction = renderVoltage2n; tempVal = '10'; break;
            case "V":
            case "v1n":
            case "voltage1n": this.renderFunction = renderVoltage1n; tempVal = '10'; break;
            case "g": this.renderFunction = renderVoltage1n; tempVal = '0'; break;
            case "l": this.renderFunction = renderInductor; tempVal = '1m'; break;
            case "i": this.renderFunction = renderCurrentSource; tempVal = '1m'; break;
            case "d": this.renderFunction = renderDiode; tempVal = '0.7'; break;
        }

        if (value == null){ value = tempVal;    }
        this.value = 1;//either a resist
        this.valueString = "1";
        this.setValue(value);
    }
    setStartPoint(x,y){
        if (x instanceof Point){
            y = x.y;
            x = x.x;
        }
        this.startPoint = new Point(x,y);
    }
    setEndPoint(x,y){
        if (x instanceof Point){
            y = x.y;
            x = x.x;
        }
        this.endPoint = new Point(x,y);
    }
    setValue(newValue = 1000){
        this.valueString = String(newValue);
        //console.log("Inputted string: " + newValue);

        //Check for postfix
        //could be optimized with indexOf -Andrew
        const validChars = ['p', 'n', 'u', 'm', 'k', 'M'];
        const validCharsLookup = [0.000000000001, 0.000000001, 0.000001, 0.001, 1000, 1000000];
        let validCharIndex = null;
        let index = 0;
        for (let i=0; i<validChars.length; i++){
            index=this.valueString.indexOf(validChars[i]);
            if (index>0){
                validCharIndex = i;
                break;
            }
            index=this.valueString.length   ;
        }
        /*
        while (index < this.valueString.length && index < 100){
            for (let i=0; i<validChars.length; i++){
                if (this.valueString[index] == validChars[i]){
                    validCharIndex = i;
                    break;
                }
            }
            index += 1;
        }
        */
        let number = Number(this.valueString.slice(0,index));
        //console.log(this.valueString.slice(0,index));

        //If number is null, it is not a valid number.
        if (isNaN(number) == true){
            this.valueIsValid = false;
            return;
        }

        this.valueIsValid = true;

        if (validCharIndex == null){    this.value = number;
        } else {    this.value = number * validCharsLookup[validCharIndex]; }
        return this.value;
        //console.log("New value: " + this.value + "  index: " + validCharIndex);
    }
    render(ctx, componentWidth, compSimulationData){
        this.renderFunction(ctx, componentWidth, this.startPoint.roundTo(gridSize), this.endPoint.roundTo(gridSize), this.valueString, compSimulationData);
    }
    toString(){
        //For each save we do: type, sp.x, sp.y, ep.x, ep.y, valueString1, valueString2...;
        return this.type+","+this.startPoint.x+","+this.startPoint.y+","+this.endPoint.x+","+this.endPoint.y+","+this.valueString+";";
    }
}

class UIButton{
    constructor(text="button", startPoint=new Point(), size=new Point(), backgroundColor = "grey", textColor = "black", highlightColor = "lightgrey"){
        this.text = text;
        this.startPoint = startPoint;
        this.size = size;
        this.backgroundColor = backgroundColor;
        this.textColor = textColor;
        this.highlightColor = highlightColor;
    }
    setPosition(upperLeftStartPoint = new Point()){ this.startPoint = upperLeftStartPoint;  }
    setSize(widthAndHeight = new Point()){  this.size = widthAndHeight; }
    pointIsOverButton(point){
        return(point.x >= this.startPoint.x && point.x <= this.startPoint.x + this.size.x &&
            point.y >= this.startPoint.y && point.y <= this.startPoint.y + this.size.y );
    }
    render(ctx, highlight = false, highlightColor = null){ //highlight can be boolean, a color string, or mousePos val
        const tempFillStyle = ctx.fillStyle;

        if (highlight instanceof Point){    highlight = this.pointIsOverButton(highlight);  }

        if (highlight == true){
            if (highlightColor != null){    ctx.fillStyle = highlightColor;
            } else {    ctx.fillStyle = this.highlightColor;    }
        } else {    ctx.fillStyle = this.backgroundColor;   }

        ctx.fillRect(this.startPoint.x, this.startPoint.y, this.size.x, this.size.y);
        ctx.fillStyle = this.textColor;
        ctx.textAlign = "center";

        const textSize = ctx.measureText(this.text);
        const verticalOffset = (textSize.actualBoundingBoxAscent - textSize.actualBoundingBoxDescent)/2
        ctx.fillText(this.text, this.startPoint.x + this.size.x/2, this.startPoint.y + this.size.y/2 + verticalOffset);
        ctx.fillStyle = tempFillStyle;
    }
}

class UIPlot extends UIButton{
    constructor(component){
        super();
        this.component = component;
    }
    getComponent(){ return this.component;  }
    render(ctx, plotWidth, plotHeight, startX, startY, midY){
        this.ctx = ctx;
        this.startPosition = new Point(startX, startY);
        this.size = new Point(plotWidth, plotHeight);
        this.startX = startX;
        this.startY = startY;
        this.width = plotWidth;
        this.height = plotHeight;

        const c = this.component;

        //Draw plot background and such
        this.ctx.beginPath();
        this.ctx.fillStyle = "black";
        this.ctx.strokeStyle = "grey";
        this.ctx.fillRect(startX, startY, plotWidth, plotHeight);
        this.ctx.moveTo(startX, midY);
        this.ctx.lineTo(startX + plotWidth, midY);
        this.ctx.stroke();
        this.ctx.closePath();

        //Draw  voltage
        this.ctx.beginPath();
        this.ctx.strokeStyle = "green";
        let dataLength = c.voltageData.length;
        
        let x = startX;
        let y = midY;
        let nextY = y;
        let maxY = 0;  //maxY & minY are used for finding and adjusting the voltageMultiplier for the next cycle
        let minY = 10000000000000;
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = "#55FF55";
        this.ctx.fillText(  (plotHeight*0.5/c.voltageMultiplier).toPrecision(5), startX, startY + 12 );
        this.ctx.fillStyle = "yellow";
        this.ctx.fillText(  (plotHeight*0.5/c.currentMultiplier).toPrecision(5), startX + 70, startY + 12 );
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "right";
        this.ctx.fillText(this.component.name, startX + plotWidth, startY + 12);
        this.ctx.moveTo(x,y);

        if (dataLength < 2) { return; }

        for (let j=Math.max(0, dataLength-plotWidth*c.plotTimeDivisor); j<dataLength; j+=c.plotTimeDivisor){
            nextY = c.voltageData[Math.round(j)]*c.voltageMultiplier;
            if (nextY > maxY) { maxY = nextY; }
            if (nextY < minY) { minY = nextY; }
            this.ctx.lineTo(x, midY - nextY);
            y = nextY;
            x += 1;
        }
        this.ctx.stroke();
        this.ctx.closePath();

        if ((maxY + 20 > plotHeight/2 || minY - 20< -plotHeight/2) && c.voltageMultiplier > 1){ //decrease voltage scale
            c.voltageMultiplier *= 0.9;
        } else if ((maxY < plotHeight/4 && minY > -plotHeight/4) && c.voltageMultiplier < 100000){ //increase voltage scale
            c.voltageMultiplier *= 1.1;
        }

        //now, adjust the voltage multiplier if needed
        //if ()

        //draw current
        this.ctx.beginPath();
        this.ctx.strokeStyle = "yellow";
        dataLength = c.voltageData.length;
        x = startX;
        y = midY;
        maxY=0;
        minY=0;
        nextY = y;
        this.ctx.moveTo(x,y);
        for (let j=Math.max(0, dataLength-plotWidth*c.plotTimeDivisor); j<dataLength; j+=c.plotTimeDivisor){
            nextY = c.currentData[Math.round(j)]*c.currentMultiplier;
            if (nextY > maxY) { maxY = nextY; }
            if (nextY < minY) { minY = nextY; }
            this.ctx.lineTo(x, midY - nextY);
            y = nextY;
            x += 1;
        }
        this.ctx.stroke();
        this.ctx.closePath();    
        if ((maxY + 20 > plotHeight/2 || minY - 20 < -plotHeight/2) && c.currentMultiplier > 1){ //decrease voltage scale
            c.currentMultiplier *= 0.9;
        } else if ((maxY < plotHeight/4 && minY > -plotHeight/4) && c.currentMultiplier < 100000){ //increase voltage scale
            c.currentMultiplier *= 1.1;
        }     
    }
}

class CircuitUI{
    constructor(htmlCanvasElement, htmlCanvasElement2=null, circuit=null){
        //Circuit stuff
        this.components = [];
        this.numNodes=2;
        this.numResistors=1;
        //add more circuit randomization parameters here

        //Canvas
        this.htmlCanvasElement = htmlCanvasElement;
        this.ctx = this.htmlCanvasElement.getContext("2d");

        //Rendering variables
        this.backgroundColor = 'rgb(240,240,240)';
        this.defaultStrokeColor = 'rgb(100,100,100)';
        this.defaultStrokeWidth = 2;
        this.defaultFont = '15px sans-serif';
        this.componentWidth = 15;

        //Plot variables
        this.plots = [];

        //buttons
        this.plotComponentButton = new UIButton( "Plot Component", new Point(330,10), new Point(150,30) );
        this.toggleSimulationRunButton = new UIButton( "Run Simulation", new Point(170,10), new Point(150,30));
        this.resetSimulationButton = new UIButton( "Reset Simulation", new Point(10,10), new Point(150,30));
        this.increasePlotTimeScaleButton = new UIButton( "+Time", new Point(), new Point(50,30) );
        this.decreasePlotTimeScaleButton = new UIButton( "-Time", new Point(), new Point(50,30) );
        this.randomizeButton = new UIButton("Randomize",new Point(800,10),new Point(150,30),"green");
        this.increaseNodesButton = new UIButton("/\\",new Point(600,10),new Point(20,15));
        this.decreaseNodesButton = new UIButton("\\/",new Point(600,25),new Point(20,15));
        this.increaseResistorsButton = new UIButton("/\\",new Point(750,10),new Point(20,15));
        this.decreaseResistorsButton = new UIButton("\\/",new Point(750,25),new Point(20,15));
        this.quitButton = new UIButton("Quit Analysis",new Point(975,10),new Point(150,30),"red");
        this.buttons = [
            this.plotComponentButton, 
            this.toggleSimulationRunButton, 
            this.resetSimulationButton,
            this.randomizeButton,
            this.increaseNodesButton,
            this.decreaseNodesButton,
            this.increaseResistorsButton,
            this.decreaseResistorsButton,
            this.quitButton];
        
        //Circuit related variables
        if(circuit==null){
            this.circuit = new Circuit();
        }else{
            this.circuit = circuit;
            this.loadFromCircuitText(this.circuit.getCircuitText());
        }
        this.nodeMap = new Map();
        this.editedCircuit = true;    //so we know when we need to update the circuit
        this.run = false;
        this.numCalculationsPerRender = 1000;

        this.userState = 'idle'; //for determining what user input pattern is currently happening

        //mouse moving stuff
        this.mousePos = new Point();
        this.mousePosDelta = new Point();
        this.mouseIsDown = false;

        //analysis stuff
        this.completedComponents=[];
        this.completedNodes=[];
        this.analysisData={
            voltage: 0, 
            current: 0,
            startNodeVoltage: 0,
            endNodeVoltage: 0,
            voltageHistory: [],
            currentHistory: [],
            resistance: 1,
            inductance: 1, 
            capacitance: 1,
        };
        this.userAnalysis="";
        this.analysisType="";
        this.named=[];
        this.loop=[];
        this.analysisFeedback=["","When you do circuit analysis, hints and feedback will be here.<br> This project is still in development, so please report any issues you see"];
        this.highlightedComponents=[];
        this.highlightedNodes=[];

        //misc variables
        this.minimumStateRadius = 10;
        this.pressedKeys = new Map();
        this.selectDistance = 15;

        updateDropdown(this.numNodes);

        this._setEventListeners(this);
        this.resize();
    }
    render() {
        if (this.run){
            this.circuit.Calculate(this.numCalculationsPerRender);
            //if in user analysis, only calculate once (achieved by turning run off)
            if(this.userState=="userAnalysis" || this.userState=="naming"){this.run=false}
            //hopefully one calculate is enough
        }

        const ctx = this.ctx; //this.htmlCanvasElement.getContext('2d');

        //Clear Screen
        ctx.fillStyle = this.backgroundColor;
        ctx.clearRect(0, 0, this.htmlCanvasElement.width, this.htmlCanvasElement.height);
        ctx.fillRect(0, 0, this.htmlCanvasElement.width, this.htmlCanvasElement.height);

        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText("t = " + this.circuit.getCurrentTime().toPrecision(5) + "s", 20, 60);
        ctx.fillText("Nodes:",525,20);
        ctx.fillText(this.numNodes,540,40);
        ctx.fillText("Resistors:",660,20);
        ctx.fillText(this.numResistors,675,40);

        //FEEDBACK TEXT
        if(this.analysisFeedback.length==1 && this.analysisFeedback[0]=="stay"){
            //okay hear me out
            //the "stay" keyword keeps the feedbackText the same
            //then update analysis feedback (by pushing something to it), then analysisFeedback.length will not be 1 (stay will remain in the array)
            //this is really stupid so I might fix it later
            //-Andrew
        }else{
            let feedbackText="";
            for(let i=1;i<this.analysisFeedback.length;++i){
                feedbackText+=this.analysisFeedback[i]+". ";
            }
            let htmlText=document.getElementById("dynamicText");
            htmlText.innerHTML=feedbackText;
            htmlText.style.color="red";
            htmlText.style.height="75px";
            htmlText.style.fontSize="20px";
            htmlText.style.padding="1%";
            this.analysisFeedback=["stay"];
            //clear the analysisFeedback array so it only sets these values once (instead of resetting the same values constantly)
        }
        
        //Set Default Colors
        ctx.fillStyle = this.defaultStrokeColor;
        ctx.lineWidth = this.defaultStrokeWidth;
        ctx.font = this.defaultFont;

        const color = "black";
        const highlightColor = "blue";

        for (let i=0; i<this.components.length; i++){
            ctx.strokeStyle = color;
            ctx.fillStyle = color;

            let compSimulationData = this.circuit.getComponentData(this.components[i].name);
            compSimulationData.current*=1000;

            if (this.userState!="naming"&&this.components[i] == this.selectedComponent&&this.selectedComponentSegment!="endPoint"&&this.selectedComponentSegment!="startPoint"){
                ctx.strokeStyle = highlightColor;
                if (this.userState == "editingComponentValue"){
                    if (this.components[i].valueIsValid == true){   ctx.fillStyle = "green";
                    } else {    ctx.fillStyle = "red";  }
                }else if (this.userState == "userAnalysis"){
                    compSimulationData=this.analysisData;
                    ctx.fillStyle = "blue";
                }
            }else if(this.userState == "userAnalysis" || this.userState == "naming"){
                if(this.highlightedComponents.includes(this.components[i])){
                    ctx.fillStyle = "lime";
                    ctx.strokeStyle = "lime";
                }else if(this.loop.includes(this.components[i])){
                    ctx.fillStyle = "blue";
                    ctx.strokeStyle = "blue";
                    //component hasn't been solved yet, so don't display the solved data yet
                    compSimulationData={
                        voltage: NaN, 
                        current: NaN,
                        startNodeVoltage: NaN,
                        endNodeVoltage: NaN,
                        voltageHistory: [],
                        currentHistory: [],
                        resistance: NaN,
                        inductance: NaN, 
                        capacitance: NaN,
                    };
                }else if(this.completedComponents.includes(this.components[i])){
                    ctx.fillStyle = "black";
                    ctx.strokeStyle = "black";
                }else{
                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "red";
                    //component hasn't been solved yet, so don't display the solved data yet
                    compSimulationData={
                        voltage: NaN, 
                        current: NaN,
                        startNodeVoltage: NaN,
                        endNodeVoltage: NaN,
                        voltageHistory: [],
                        currentHistory: [],
                        resistance: NaN,
                        inductance: NaN, 
                        capacitance: NaN,
                    };                   
                }
            }
            this.components[i].render(ctx, this.componentWidth, compSimulationData);
        }

        //nodal voltage display
        //console.log(this.nodeMap);
        const keysArray = Array.from( this.nodeMap.keys() );
        for (let i=0; i<keysArray.length; i++){
            const key = keysArray[i];
            const name = this.nodeMap.get(key);
            const point = new Point().fromHashCode(key);
            let voltage = this.circuit.getNodeVoltage(String(name));
            ctx.fillStyle=styleFromVoltage(voltage);
            if(this.userState == "naming" && this.analysisType=="Nodal"){
                if(this.completedNodes.includes(name)){ continue; }
                let nameIndex = this.named.indexOf(name);
                if(nameIndex==-1){
                    ctx.fillStyle="red";
                    ctx.fillText("?", point.x+5, point.y-5,);
                }else{
                    ctx.fillStyle="black";
                    ctx.fillText("V"+(nameIndex+1), point.x+5, point.y-5,);
                }
            }else{ 
                if(this.userState=="userAnalysis"){
                    if(name==this._getSelectedNode()){
                        ctx.fillStyle="blue";
                        voltage=Number(this.userAnalysis);
                    }
                }
                if(this.userState=="userAnalysis"&&!this.completedNodes.includes(name)&&name!=this._getSelectedNode() || this.userState == "naming"){
                    //console.log(this.highlightedNodes,name);
                    if(this.highlightedNodes.includes(name)){
                        ctx.fillStyle = "lime";
                        ctx.fillRect(point.x-2, point.y-18, 15, 15);
                    }
                    ctx.fillStyle="black";
                    ctx.fillText("?", point.x+5, point.y-5,);
                }else if(voltage!=undefined&&!isNaN(voltage)){
                    //console.log(voltage,key,point);
                    //console.log(ctx.fillStyle);
                    ctx.fillText(voltage.toPrecision(3), point.x+5, point.y-5,);
                }
            }
        }
        this._renderButtons();
        this._renderPlots();
        if(this.analysisType=="Mesh"){
            this._renderLoops();
        }
    }
    _renderButtons(){
        const falseColor = "#DD4444";
        const falseColorHighlight = "#FF4444";
        const trueColor = "#44DD44";
        const trueColorHighlight = "#44FF44";
        const disableColor = "#88888844";

        //Run/Stop button
        if (this.run == true){
            this.toggleSimulationRunButton.backgroundColor = trueColor;
            this.toggleSimulationRunButton.highlightColor = trueColorHighlight;
        } else {
            this.toggleSimulationRunButton.backgroundColor = falseColor;
            this.toggleSimulationRunButton.highlightColor = falseColorHighlight;
        }

        //Reset Simulation Button
        if (this.editedCircuit == true){
            this.resetSimulationButton.backgroundColor = falseColor;
            this.resetSimulationButton.highlightColor = falseColorHighlight;
        } else {
            this.resetSimulationButton.backgroundColor = trueColor;
            this.resetSimulationButton.highlightColor = trueColorHighlight;
        }

        //Plot component button
        if (this.selectedComponent != null){
            if (this._componentIsPlotted(this.selectedComponent)){
                this.plotComponentButton.backgroundColor = falseColor;
                this.plotComponentButton.highlightColor = falseColorHighlight;
                this.plotComponentButton.text = "Remove Plot";
            } else {
                this.plotComponentButton.backgroundColor = trueColor;
                this.plotComponentButton.highlightColor = trueColorHighlight;
                this.plotComponentButton.text = "Plot Component";
            }
        } else {
            this.plotComponentButton.text = "";
            this.plotComponentButton.backgroundColor = disableColor;
            this.plotComponentButton.highlightColor = disableColor;
        }

        //Quit analysis button
        if(this.userState=="naming"||this.userState=="userAnalysis"){
            this.quitButton.text = "Quit Analysis";
            this.quitButton.backgroundColor = "red";
            this.quitButton.highlightColor = "lightgrey"
        }else{
            this.quitButton.text = "";
            this.quitButton.backgroundColor = disableColor;
            this.quitButton.highlightColor = disableColor;
        }
        for(let i = 0; i<this.buttons.length;++i){
            this.buttons[i].render(this.ctx,this.mousePos);
        }
    }
    _renderPlots(){
        if (this.plots.length < 1) { return; }
        const paddingX = 20; //horizontal padding between each plot
        const paddingY = 20; //vertical padding from bottom of canvas
        const plotWidth = (this.htmlCanvasElement.width / this.plots.length) - paddingX; //width of each plot
        const plotHeight = this.htmlCanvasElement.height/4; //height of each plot
        const startY = this.htmlCanvasElement.height*3/4 - 20; //the upper lefthand corner y component of each plot
        let startX = paddingX/2; //the upper lefthand corner x component of each plot (increments by plotWidth+paddingX each time)
        const midY = startY + plotHeight/2; //midY is the middle of the plot, or the 0 line

        //for each plotted component
        for (let i=0; i<this.plots.length; i++){
            const p = this.plots[i];
            const c = p.getComponent();
            if (this.run == true){ //if running the simulation, get component data from this.circuit object
                const data = this.circuit.getComponentData(c.name);
                if (data != null) { 
                    c.voltageData = data.voltageHistory;
                    c.currentData = data.currentHistory;
                }
            }

            p.setPosition(new Point(startX, startY));
            p.setSize(new Point(plotWidth, plotHeight));
            p.render(this.ctx, plotWidth, plotHeight, startX, startY, midY, paddingX);
            if (this.selectedComponent == c)
            {
                this.ctx.beginPath();
                this.ctx.fillStyle = "#4444DD";
                this.ctx.fillRect(startX, startY-4, plotWidth, 4);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            startX += plotWidth + paddingX;
        }
    }
    _renderLoops(){
        const ctx = this.ctx; //this.htmlCanvasElement.getContext('2d');
        for(let i=0;i<this.named.length;++i){
            let centerpoint=midPoint(this.named[i]);
            let size=distanceFromMidpoint(centerpoint,this.named[i]);
            // Create a new image element
            const image = new Image();
            image.id = 'renderedImage'+i; // Set a unique identifier for the image

            // Set the source of the image
            image.src = "https://www.svgrepo.com/download/69401/circular-arrow.svg";

            // Calculate the top-left corner based on the center point
            const left = centerpoint.x - size / 4;
            const top = centerpoint.y - size / 4;

            // Append the image to the body
            //document.body.appendChild(image);
            if(this.loopDirections[i]){
                //mirror the image
                ctx.translate(left+size/2,top);
                ctx.scale(-1,1);
                ctx.drawImage(image,0,0,size/2,size/2);
            }else{
                ctx.drawImage(image,left,top,size/2,size/2);
            }

            //reset ctx
            ctx.setTransform(1,0,0,1,0,0);

            //Set Default Colors
            ctx.fillStyle = this.defaultStrokeColor;
            ctx.lineWidth = this.defaultStrokeWidth;
            ctx.font = this.defaultFont;

            ctx.strokeStyle = "black";
            ctx.highlightColor = "black";
            ctx.fillText("I"+(i+1), centerpoint.x-10, centerpoint.y-10,);
        }
    }
    resize() { 
        const bb = this.htmlCanvasElement.getBoundingClientRect();
        this.htmlCanvasElement.width = Math.round(bb.width);
        this.htmlCanvasElement.height = Math.round(bb.height);
        //this.ctx = this.htmlCanvasElement.getContext("2d");
    }
    __pointToLineSegmentDistance(p = new Point(), sp = new Point(), ep = new Point()) {
        const A = p.x - sp.x;
        const B = p.y - sp.y;
        const C = ep.x - sp.x;
        const D = ep.y - sp.y;
      
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq != 0) //in case of 0 length line
            param = dot / len_sq;
      
        let xx, yy;
      
        if (param < 0){
          xx = sp.x;
          yy = sp.y;
        }else if (param > 1){
          xx = ep.x;
          yy = ep.y;
        }else{
          xx = sp.x + param * C;
          yy = sp.y + param * D;
        }
      
        const dx = p.x - xx;
        const dy = p.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    _getComponentAndSegmentClicked(){
        let closestComp = null;
        let closestDist = this.selectDistance;
        let segment = "s"; //either s, e, or l, defining if we're close to the startPoint, endPoint, or line

        for (let i=0; i<this.components.length; i++){
            const c = this.components[i];

            const nodalVoltageStartPoint=c.startPoint.add(10,-15);
            const nodalVoltageEndPoint=c.endPoint.add(10,-15);

            //console.log(this.mousePos,c.startPoint,c.endPoint);
            const distToLine = this.__pointToLineSegmentDistance(this.mousePos, c.startPoint, c.endPoint);
            const distToStartPoint = Math.min(this.mousePos.distTo(c.startPoint),this.mousePos.distTo(nodalVoltageStartPoint));
            const distToEndPoint = Math.min(this.mousePos.distTo(c.endPoint),this.mousePos.distTo(nodalVoltageEndPoint));

            //console.log(distToLine,distToStartPoint,distToEndPoint);
            if(distToLine<closestDist){
                if (distToLine < distToStartPoint-this.selectDistance && distToLine < distToEndPoint-this.selectDistance){
                    closestDist = distToLine;
                    closestComp = c;
                    segment = "line";
                }
            }
            if (distToStartPoint < closestDist){
                closestDist = distToStartPoint;
                if(distToStartPoint<this.selectDistance){
                    closestComp = c;
                    segment = "startPoint";
                }
            }
            if (distToEndPoint<closestDist){
                closestDist = distToEndPoint;
                if(distToEndPoint<this.selectDistance){
                    closestComp = c;
                    segment = "endPoint";
                }
            }
        }

        if (closestComp != null){
            //console.log(closestComp.name + " " + segment);
            return {component:closestComp, segment:segment};
        }
        return {
            component: null,
            segment: null,
        }
    }
    _getButtonAtPos(pos){
        for (let i=0; i<this.buttons.length; i++){
            if (this.buttons[i].pointIsOverButton(pos)){
                return this.buttons[i];
            }
        }
        return null;
    }
    _getPlotAtPos(pos){
        for (let i=0; i<this.plots.length; i++){
            if (this.plots[i].pointIsOverButton(pos)){  return this.plots[i];   }
        }
        return null;
    }

    _deleteComponent(component = null){
        if (component == null){ component = this.selectedComponent; }
        for(let i=0; i<this.components.length; i++){
            if (this.components[i] == component){
                this.components.splice(i,1);
                break;
            }
        }
        this._removePlot(component);
    }

    _addPlot(component){
        if (component == null){ component = this.selectedComponent;}
        if (component == null){ return; }
        //if (component instanceof UIComponent)
        if (this._removePlot(component) == false){
            this.plots.push(new UIPlot(component));
        }
    }
    _removePlot(component){
        if (component == null){ component = this.selectedComponent; }

        for(let i=0; i<this.plots.length; i++){
            if (this.plots[i].component == component){
                this.plots.splice(i,1);
                return true;
            }
        }
        return false;
    }
    _componentIsPlotted(component){
        for (let i=0; i<this.plots.length; i++){
            if (this.plots[i].getComponent() == component){
                return true;
            }
        }
        return false;
    }

    _eventListener(event) {
        let keyPressed = null;
        let rawKeyPressed = null;
        let keyReleased = null;
        let newMousePos;
        let ret;
        this.mousePosDelta.set(0,0);
        const componentShortcuts = ['w', 'r', 'c', 'i', 'v', 'V', 'g', 'l', 'd'];
        let componentOver = null;
        let componentOverSegment = null;
        let buttonOver = null; //which UIbutton (from this.buttons) was clicked
        let plotOver = null;

        //get data from event
        if (event == null){
            event = {type: 'unknown_event'};
            console.error("event listener was passed an event without a type!");
        }
        switch (event.type) {
            case 'mousedown':
                newMousePos = new Point(event.offsetX, event.offsetY);
                this.mousePosDelta = newMousePos.sub(this.mousePos);
                this.mousePos = newMousePos;

                this.mouseIsDown = true;
                ret = this._getComponentAndSegmentClicked();
                componentOver = ret.component;
                componentOverSegment = ret.segment;
                buttonOver = this._getButtonAtPos(this.mousePos);
                plotOver = this._getPlotAtPos(this.mousePos);
                break;
            case 'mouseup':
                newMousePos = new Point(event.offsetX, event.offsetY);
                this.mousePosDelta = newMousePos.sub(this.mousePos);
                this.mousePos = newMousePos;
                this.mouseIsDown = false;
                break;
            case 'mousemove':
                newMousePos = new Point(event.offsetX, event.offsetY);
                this.mousePosDelta = newMousePos.sub(this.mousePos);
                this.mousePos = newMousePos;
                ret = this._getComponentAndSegmentClicked();
                componentOver = ret.component;
                componentOverSegment = ret.segment;
                //if(componentOverSegment!=null){
                //    console.log(componentOverSegment);
                //}
                buttonOver = this._getButtonAtPos(this.mousePos);
                plotOver = this._getPlotAtPos(this.mousePos);
                break;
            case 'mouseout':
                newMousePos = new Point(event.offsetX, event.offsetY);
                this.mousePosDelta = newMousePos.sub(this.mousePos);
                this.mousePos = newMousePos;
                this.mouseIsDown = false;
                break;
            case 'dblclick':
                newMousePos = new Point(event.offsetX, event.offsetY);
                this.mousePosDelta = newMousePos.sub(this.mousePos);
                this.mousePos = newMousePos;
                this.mouseIsDown = false;
                ret = this._getComponentAndSegmentClicked();
                componentOver = ret.component;
                componentOverSegment = ret.segment;
                buttonOver = this._getButtonAtPos(this.mousePos);
                plotOver = this._getPlotAtPos(this.mousePos);
                break;
            case 'keydown':
                keyPressed = event.key.toLowerCase();
                rawKeyPressed = event.key;
                this.pressedKeys.set(keyPressed,true);
                break;
            case 'keyup':
                keyReleased = event.key.toLowerCase();
                this.pressedKeys.set(keyReleased,false);
                break;
        }
        
        /////Possible States
        // idle                 nothing currently happening
        // creatingComponent
        // movingComponent
        // editingComponentValue 
        // finishingEditingComponentValue
        // userAnalysis                 takes user input for a component/nodal voltage or current
        // naming                       takes user inputs for naming of nodes/loops in nodal/mesh analysis

        //console.log(this.userState);

        if (event.type == "keydown" && keyPressed == "p"){  console.log(this.circuit.getCircuitText());    }
        if (event.type == "keydown" && keyPressed == "enter"){  /*this.circuit = new Circuit( this._getCircuitText() );*/ }
        if (event.type == "mousemove"){ //handle mouse cursor type (if over button or over component, change cursor style);
            if (componentOver != null) {    this.htmlCanvasElement.style.cursor="crosshair";
            } else if (plotOver != null || buttonOver != null) {    this.htmlCanvasElement.style.cursor="pointer";
            } else {    this.htmlCanvasElement.style.cursor="default";  }
        }

        document.getElementById("userStateDiv").innerText = " " + this.userState;
        document.getElementById("selectedCompDiv").innerText = " " + this.selectedComponent?.name;

        if (this.userState == "idle"){
            if (event.type == 'keydown' && keyPressed == "escape"){ //deselection
                this.selectedComponent = null;
                return;
            }
            if ( event.type == "mousedown" && buttonOver != null){ // a UIbutton was clicked
                //console.log("button pressed: ",buttonOver);
                switch(buttonOver){           //plotComponentButtonClicked
                    case this.plotComponentButton: this._addPlot(this.selectedComponent); break;
                    case this.toggleSimulationRunButton:
                        if(this.circuit.getCircuitText()!=""){
                            if (this.run == true){
                                this.run = false;
                                this.toggleSimulationRunButton.text = "Run Simulation";
                            } else { 
                                if(document.getElementById("menu").value==""){
                                    this.run = true;
                                    this.toggleSimulationRunButton.text = "Stop Simulation";
                                } else{
                                    //do step by step circuit analysis
                                    this.circuitAnalysis();
                                }
                            }
                        }
                        break;
                    case this.resetSimulationButton: this._resetSimulation(); break;
                    // case this.redirectButton: this.redirectButton.redirectToWebsite(); break;
                    // case this.reportButton: this.reportButton.redirectToWebsite(); break;
                    case this.randomizeButton: 
                        this.circuit.randomize(this.numNodes,this.numResistors); 
                        //console.log(this.circuit.getCircuitText());
                        this.loadFromCircuitText(this.circuit.getCircuitText());
                        updateDropdown(this.numNodes);
                        break;
                    case this.increaseNodesButton: 
                        if(this.numNodes<=this.numResistors){this.numNodes++;}
                        else{this.increaseResistorsButton.backgroundColor="lime";}
                        break;
                    case this.decreaseNodesButton: 
                        if(this.numNodes>2){
                            this.numNodes--;
                            this.increaseResistorsButton.backgroundColor="grey";
                            this.decreaseNodesButton.backgroundColor="grey";
                        }
                        break;
                    case this.increaseResistorsButton: 
                        this.numResistors++;
                        this.increaseResistorsButton.backgroundColor="grey";
                        this.decreaseNodesButton.backgroundColor="grey";
                        break;
                    case this.decreaseResistorsButton: 
                        if(this.numResistors>1){
                            if(this.numNodes<=this.numResistors){
                                this.numResistors--;
                            }else{
                                this.decreaseNodesButton.backgroundColor="lime";
                            }
                        }
                        break;

                }
                return;
            }
            if (event.type == "mousedown" && plotOver != null){ // a Plot was clicked
                this.selectedComponent = plotOver.getComponent();
                return;
            }
            if (event.type == "mousedown" && componentOver == null){ //deselection of component
                this.selectedComponent = null;
                return;
            }
            if (event.type == 'keydown' && (keyPressed == 'delete' || keyPressed == 'backspace') && this.selectedComponent != null){ //delete component
                this._deleteComponent(this.selectedComponent);
                return;
            }
            if (event.type == 'keydown') { //potentially making new component (searches through componentShortcuts)
                for (let i=0; i<componentShortcuts.length; i++){
                    if (componentShortcuts[i] == rawKeyPressed){
                        this.userState = "creatingComponent";
                        this.componentTypeToDraw = rawKeyPressed;
                    }
                }
            }
            if (event.type == "mousedown" && componentOver != null && this.pressedKeys.get("shift") == true){ //plot component
                this._addPlot(componentOver);
                return;
            }
            if (event.type == "mousedown" && componentOver != null){ //switch to moving component
                this.selectedComponent = componentOver;
                this.selectedComponentSegment = componentOverSegment;
                this.userState = "movingComponent";
                this.movedSelectedComponent = false;
                return;
            }
            if (event.type == "dblclick" && componentOver != null){ //dbl click means editingComponentValue
                this.selectedComponent = componentOver;
                this.selectedComponentSegment = componentOverSegment;
                this.userState = "editingComponentValue";
            }
        }

        if (this.userState == "movingComponent"){
            if (this.mouseIsDown == false ||  keyPressed == "escape" || event.type == "mouseup"){
                if (this.movedSelectedComponent){   this.editedCircuit = true;  }
                this.movedSelectedComponent = false;
                this.userState = "idle";
                //find some way to get the nodal voltages to move
                this._getCircuitText();
            }
            
            //This is used to check if we actually moved the component, or just clicked it. If we just clicked it, then we didn't edit the circuit, thus the circuit was not edited.
            if (event.type == "mousemove"){
                this.movedSelectedComponent = true;
                if (this.selectedComponentSegment == "startPoint"){
                    this.selectedComponent.startPoint = this.mousePos.copy();
                } else if (this.selectedComponentSegment == "endPoint"){
                    this.selectedComponent.endPoint = this.mousePos.copy();
                } else {
                    this.selectedComponent.startPoint.addi(this.mousePosDelta);
                    this.selectedComponent.endPoint.addi(this.mousePosDelta);
                }
            }
        }

        if (this.userState == "editingComponentValue"){
            if ( keyPressed == "escape" || event.type == "mousedown" || keyPressed == "enter"){
                this.userState = "finishingEditingComponentValue";
            }
            if (event.type == "keydown"){
                if (keyPressed == "backspace"){
                    let len = this.selectedComponent.valueString.length;
                    this.selectedComponent.setValue( this.selectedComponent.valueString.slice(0, len-1) );
                } else if (keyPressed.length < 2) {
                    this.selectedComponent.setValue( this.selectedComponent.valueString + rawKeyPressed );
                }
            }
        }

        if (this.userState == "finishingEditingComponentValue"){
            if (this.circuit != null){
                try {
                    this.circuit.setComponentValue(this.selectedComponent.name, this.selectedComponent.value);
                } catch {
                    console.error("Failed to set component value.");
                }
            }
            this.userState = "idle";
            return;
        }

        if (this.userState == "userAnalysis"){
            if ( event.type == "mousedown" && buttonOver == this.quitButton){
                this.userState="idle";
                this.analysisFeedback=[];
                this._resetSimulation();
            }
            if (event.type == "dblclick" && componentOver != null){ //dbl click means editingComponentValue
                //we don't want to be able to select non-resistor components (we can select their nodes tho)
                if(componentOver.type=="r"||componentOver.type=="resistor"||componentOverSegment!="line"){
                    this.selectedComponent = componentOver;
                    this.selectedComponentSegment = componentOverSegment;
                    //remember, this.selectedComponentSegment is either line, startPoint, or endPoint
                    this._updateAnalysisData(); 
                }
            }else if (this.selectedComponent!=null){
                if( (keyPressed == "escape" || event.type == "mousedown" || keyPressed == "enter")){
                    //user deselects a component (they're done entering the value)
                    //console.log(this.selectedComponent,this.selectedComponentSegment);
                    //console.log(this.analysisData);
                    //console.log(this.userAnalysis);
                    ///*
                    //the 4 methods
                    if(this._enoughInfoToSolve()){
                        if(this._checkCorrectness()){
                            //user had enough info and was correct
                            switch(this.selectedComponentSegment){  //mark the appropriate component/node as complete
                                case "line":
                                    this.completedComponents.push(this.selectedComponent);
                                    break;
                                case "startPoint":
                                    this.completedNodes.push(this.selectedComponent.startNodeName);
                                    break;
                                case "endPoint":
                                    this.completedNodes.push(this.selectedComponent.endNodeName);
                                    break;
                            }
                            this._updateWires();
                            this.analysisFeedback=[];
                            this.highlightedComponents=[];
                            this.highlightedNodes=[];
                            if(this._circuitIsDone()){
                                //circuit analysis is done
                                this.userState="idle";
                            }
                        }else{
                            //user had enough info, but was incorrect
                            this._giveHints();
                            this.highlightedComponents=[];
                            this.highlightedNodes=[];
                        }
                    }else{
                        //user didn't have enough info
                        this._showMissingInfo();
                    }
                    //*/
                    this.selectedComponent=null;
                    this.userAnalysis="";
                    this.analysisData={
                        voltage: NaN, 
                        current: NaN,
                        startNodeVoltage: NaN,
                        endNodeVoltage: NaN,
                        voltageHistory: [],
                        currentHistory: [],
                        resistance: NaN,
                        inductance: NaN, 
                        capacitance: NaN,
                    };
                }else if (event.type == "keydown"){
                    if(keyPressed=="backspace"){
                        let len = String(this.userAnalysis).length;
                        this.userAnalysis = String(this.userAnalysis).slice(0, len-1);
                    } else if (keyPressed.length < 2){
                        //gotta make sure the program doesn't crash if a non-number is entered
                        //if(!isNaN(Number(rawKeyPressed))){
                            this.userAnalysis = String(this.userAnalysis)+rawKeyPressed;
                        //}
                    }
                    this._updateAnalysisData()
                }
            }
            
        }
        if(this.userState=="naming"){
            if ( event.type == "mousedown" && buttonOver == this.quitButton){
                this.userState="idle";
                this.analysisFeedback=[];
                this._resetSimulation();
            }
            if(this.analysisType=="Nodal"){
                //nodal
                if (event.type == "dblclick" && componentOver != null){ //dbl click means naming a node
                    this.selectedComponent = componentOver;
                    this.selectedComponentSegment = componentOverSegment;
                    //we don't want to be able to select non-nodes (and nodes we've already named)
                    let selectedNode=this._getSelectedNode();
                    if(componentOverSegment!="line" && !this.named.includes(selectedNode) && !this.completedNodes.includes(selectedNode)){
                        this.named.push(selectedNode);
                        //somehow figure out if we've named all the nodes
                        //console.log(this.named.length,this.completedNodes.length,this.nodes.length);
                        if((this.named.length+this.completedNodes.length)==this.nodes.length){
                            //all nodes have been named
                            //console.log("next");
                            this.analysisFeedback=[];
                            openPopup(this.named.length);
                        }
                    }
                }
            }else{
                //mesh
                if (event.type == "dblclick" && componentOver != null){ //dbl click means naming a node
                    this.selectedComponent = componentOver;
                    this.selectedComponentSegment = componentOverSegment;
                    //we only care about selecting components (not nodes) that aren't already in the current loop
                    if(componentOverSegment=="line" ){
                        if(!this.loop.includes(this.selectedComponent)){
                            //adds the component to the loop
                            this.loop.push(this.selectedComponent);
                            //figure out if we've completed the loop
                            if(isLoop(this.loop)){
                                //todo: figure out if adding this loop is necessary

                                this.named.push(this.loop);
                                this.loopDirections.push(false);
                                this.loop=[];
                                console.log(this.named);
                                //figure out if the loops we have are adequate
                                let distinctComponents = new Set();

                                // Loop through each loop in this.named
                                this.named.forEach(loop => {
                                    // Loop through each component in the loop
                                    loop.forEach(component => {
                                        // Add component to the set
                                        if(component.type=='r'||component.type=='c'||component.type=='l'){
                                            distinctComponents.add(component);
                                        }
                                    });
                                });
                                //Be careful that you don't allow the user to push the buttons that change the number of resistors
                                //console.log(distinctComponents.size,this.numResistors);
                                if(distinctComponents.size>=this.numResistors){
                                    //all loops have been named
                                    //console.log("next");
                                    this.selectedComponent=null;
                                    this.selectedComponentSegment=null;
                                    this.analysisFeedback=[];
                                    openPopup(this.named.length,false);
                                }

                            }
                        }else{
                            //removes the component from the loop
                            this.loop.splice(this.loop.indexOf(this.selectedComponent),1);
                        }
                    }
                }else if (event.type == "dblclick"){
                    for(let i=0;i<this.named.length;++i){
                        if(newMousePos.distTo(midPoint(this.named[i]))<50){
                            this.loopDirections[i]=!this.loopDirections[i];
                        }
                    }
                }
            }
        }
        if (this.userState == "creatingComponent"){
            if (event.type == 'mousedown'){
                this.selectedComponent = new UIComponent(this.componentTypeToDraw);
                this.components.push(this.selectedComponent);
                this.selectedComponent.setStartPoint( this.mousePos.x, this.mousePos.y );
                this.selectedComponent.setEndPoint( this.mousePos.x, this.mousePos.y );
                this.userState = "movingComponent";
                this.selectedComponentSegment = "endPoint";
            }
        }
    }
    _setEventListeners(selfObject){
        //mouse listeners
        ['mousedown', 'mouseup', 'mousemove', 'mouseout', 'dblclick'].forEach(function(eventType){
            selfObject.htmlCanvasElement.addEventListener(eventType, function(e) {
                selfObject._eventListener(e);
            })
        });

        //keyboard listeners
        ['keyup', 'keydown'].forEach(function(eventType){
            document.addEventListener(eventType, function(e) {
                selfObject._eventListener(e);
            })
        });

        //window listener (resize)
        window.addEventListener('resize', function(e){
            selfObject.resize(e);
        });

        //message listener (from popups)
        window.addEventListener('message', function(event) {
            //matrix is still in its raw form, so convert it into matA and matB
            //such that matA * matV (the voltages) = matB
            let matA=[];
            let matB=[];
            //use event.data
            for(let i=0;i<selfObject.named.length;++i){
                for(let j=0;j<selfObject.named.length;++j){
                    matA.push(Number(event.data[i*(selfObject.named.length+1)+j]));
                }
                //matA.push(...event.data.slice(i*(selfObject.named.length+1),(i+1)*(selfObject.named.length+1)-1));
                matB.push(Number(event.data[(i+1)*(selfObject.named.length+1)-1]));
            }
            if(selfObject._checkCorrectness(matA,matB)){
                //user's matrix is good
                selfObject.userState="idle";
                closePopup();
                this.analysisFeedback=[];
            }else{
                //user's matrix is incorrect
                console.log("matrix incorrect try again");
                selfObject._giveHints();
            }
        });
    }

    loadFromSave(saveText = ""){
        saveText.replace(" ", "");
        const arr = saveText.split(";");

        for (let i=0; i<arr.length; i++){
            const s = arr[i];
            if (s.length < 4){  continue;   }

            const a = s.split(",");
            let c;
            if (a.length == 6){
                c = new UIComponent(a[0], new Point(a[1], a[2]), new Point(a[3], a[4]), a[5]);
            } else if (a.length == 7){
                c = new UIComponent(a[0], new Point(a[1], a[2]), new Point(a[3], a[4]), a[5], a[6]);    //a[6] is the given name
            }

            if (c != null){ this.components.push(c);  }
        }
        this._resetSimulation();    //calls new Circuit(this._getCircuitText()); 
    }

    _getCircuitText(){
        //this function is used to convert the UI circuit into a text string the Circuit() class can understand and simulate.
        this.nodeMap = new Map(); //maps position on screen (point.getHashCode()) to node name

        this.nodes = [];
        let nodeOn = 0;
        //first, map all of the wire points to nodes.
        for (let i=0; i<this.components.length; i++){
            const c= this.components[i];
            if (!(c.type == "wire" || c.type == "w")) { continue; }

            let sn = this.nodeMap.get(c.startPoint.getHashCode());
            let en = this.nodeMap.get(c.endPoint.getHashCode());
            if (sn == null && en == null){ //case 1: both are null - get next node name and set both points to it in the map
                this.nodeMap.set(c.startPoint.getHashCode(), nodeOn);
                this.nodeMap.set(c.endPoint.getHashCode(), nodeOn);
                this.nodes.push(nodeOn);
                nodeOn += 1;
            } else if (sn == null && en != null){ //case 2 & 3: one is null: set null point to non-null point node.
                this.nodeMap.set(c.startPoint.getHashCode(), en);
            } else if (sn != null && en == null){
                this.nodeMap.set(c.endPoint.getHashCode(), sn);
            } else {                //Case 4: both are not null - take the smallest node, and set all of the larger ones to it.
                //both are not null;
                //something here is wrong...
                if (sn == en){
                    //do nothing..?
                } else {
                    const keysArray = Array.from( this.nodeMap.keys() );
                    if (sn < en){
                        //convert all en to sn
                        for (let k=0; k<keysArray.length; k++){
                            if (this.nodeMap.get(keysArray[k]) == en){
                                this.nodeMap.set(keysArray[k], sn);
                            }
                        }
                    } else {
                        //convert all sn to en
                        for (let k=0; k<keysArray.length; k++){
                            if (this.nodeMap.get(keysArray[k]) == sn){
                                this.nodeMap.set(keysArray[k], en);
                            }
                        }
                    }
                }
            }
            
        }

        //next, map all other component points to nodes.
        for (let i=0; i<this.components.length; i++){
            const c = this.components[i];
            //get sn name from map. if null, create new node. after, set c.startNodeName to the node value; repeat for endnode
            let sn = this.nodeMap.get(c.startPoint.getHashCode());
            if (sn == null){
                this.nodeMap.set(c.startPoint.getHashCode(), nodeOn);
                this.nodes.push(nodeOn);
                nodeOn += 1;
            }
            c.startNodeName = this.nodeMap.get(c.startPoint.getHashCode());


            let en = this.nodeMap.get(c.endPoint.getHashCode());
            if (en == null){
                this.nodeMap.set(c.endPoint.getHashCode(), nodeOn);
                this.nodes.push(nodeOn);
                nodeOn += 1;
            }
            c.endNodeName = this.nodeMap.get(c.endPoint.getHashCode());

        }

        //now, we have mapped all of the components to nodes.
        let s = ""; //format: type, name, node1Name, node2Name, value, ... 
        for (let i=0; i<this.components.length; i++){
            const c = this.components[i];
            if (c.type == "w" || c.type == "wire") { continue; }

            s += c.type+","+c.name+","+c.startNodeName+","+c.endNodeName+","+c.value+",";
        }
        //console.log(s);
        //console.log(this.nodeMap);
        return s;
    }
    _resetSimulation(){
        //this is meant to update the virtual circuit with any changes made to the UI Circuit
        this.circuit = new Circuit(this._getCircuitText());
        this.editedCircuit = false;
    }
    _resetVisualComponents(){
        this.components = [];
        this.plots = [];
        this.nodeMap = new Map();
        this.editedCircuit = true;    //so we know when we need to update the circuit
        this.run = false;
        this.numCalculationsPerRender = 1000;

        this.userState = 'idle'; //for determining what user input pattern is currently happening
    }
    //todo: this is a big fat method that works (mostly) but needs to be refactored
    //it takes in a circuitText string, then uses force directed node stuff to make a layout
    loadFromCircuitText(circuitText = ""){
        this._resetVisualComponents();
        let nodes = [];                 //the int names of the nodes
        let nodeMap = new Map();        //nodeMap allows for us to quickly search for nodes by name;
        let points = [];                //the Point locations of each node on the UI
        let duplicateEdges = new Map(); //duplicateEdges makes sure that attraction doesn't go crazy for two nodes with several components between them
        let numDuplicates = 0;          //stores the number of extra parallel edges
        let connectionsMap = new Map(); //stores node connections (to detect parallel edges)

        //Remove all spaces, returns, etc from string, and convert to a list
        circuitText = circuitText.split(' ').join('');
        circuitText = circuitText.split('\n').join('');
        circuitText = circuitText.split('\r').join('');
        circuitText = circuitText.toLowerCase();

        const list = circuitText.split(',');    //list contains all of the components (edges)

        //first get a list of all of the nodes and Points
        for (let i=0; i<list.length-4; i+=5) {
            //exclude ground components
            if(list[i]=="voltage1n"||list[i]=="v1n"||list[i]=="g"){continue;}
            let node1Name = list[i+2];
            let node2Name = list[i+3];
            if(connectionsMap.get(node1Name)!=null&&connectionsMap.get(node1Name).has(node2Name)){//component is parallel to a previous component
                let newNode1=Number.MAX_SAFE_INTEGER-numDuplicates*2;
                let newNode2=Number.MAX_SAFE_INTEGER-numDuplicates*2-1;
                nodes.push(newNode1);    //makes up a new node number
                nodeMap.set(newNode1,nodes.length-1);
                nodes.push(newNode2);
                nodeMap.set(newNode2,nodes.length-1);
                let point1=new Point(Math.random()*1000,Math.random()*1000);
                let point2=new Point(Math.random()*1000,Math.random()*1000);
                points.push(point1); //adds a point on the UI that is associated with the node
                points.push(point2); //adds a point on the UI that is associated with the node
                duplicateEdges.set(i,{newNode1,newNode2});
                numDuplicates++;
            }else{
                //add node1Name<->node2Name to connectionsMap
                if(connectionsMap.get(node1Name)==null){
                    connectionsMap.set(node1Name,new Set());
                }
                connectionsMap.get(node1Name).add(node2Name);
                if(connectionsMap.get(node2Name)==null){
                    connectionsMap.set(node2Name,new Set());
                }
                connectionsMap.get(node2Name).add(node1Name);
            }
            if (nodeMap.get(node1Name) == null){
                nodes.push(node1Name);
                nodeMap.set(node1Name, nodes.length-1);
                points.push(new Point(Math.random()*1000,Math.random()*1000)); //adds a point on the UI that is associated with the node
            }
            if (nodeMap.get(node2Name) == null){
                nodes.push(node2Name);
                nodeMap.set(node2Name, nodes.length-1);
                points.push(new Point(Math.random()*1000,Math.random()*1000)); //adds a point on the UI that is associated with the node
            }
        }
        //uses a force-directed layout
        const k = 0.01; // Spring constant
        const c = 10; // Repulsion constant
        const damping = 0.9; // Damping factor to avoid oscillations

        let forceX = 0;
        let forceY = 0;
        for(let l=0;l<nodes.length*100;++l){ //do the force updating a few times proportional to the number of nodes
            //calculate and apply "forces" to nodes to find their correct location
            for(let i=0; i<nodes.length;++i){
                //attraction (nodes connected by edges attract)
                for (let j=0; j<list.length-4; j+=5) {
                    if(list[j]=="voltage1n"||list[j]=="v1n"||list[j]=="g"){continue;}
                    let node1Name;
                    let node2Name;
                    if(duplicateEdges.get(j)==null){
                        node1Name = list[j+2];
                        node2Name = list[j+3];
                    }else{
                        //console.log(duplicateEdges.get(j));
                        node1Name = duplicateEdges.get(j).newNode1;
                        node2Name = duplicateEdges.get(j).newNode2;
                    }
                    //if edge doesn't contain nodes[i], repulsion of midpoint
                    if(nodes[i]!=node1Name&&nodes[i]!=node2Name){
                        //console.log(node1Name);
                        //console.log(points[nodeMap.get(node1Name)]);
                        //console.log(points[nodeMap.get(node2Name)]);
                        const midpoint = points[nodeMap.get(node1Name)].midpoint(points[nodeMap.get(node2Name)]);
                        const dx = points[i].dx(midpoint);
                        const dy = points[i].dy(midpoint);
                        const distance = points[i].distTo(midpoint);
                        if(distance!=0){
                            const force = (c*c) / distance;
                            forceX+=force*(dx/distance);
                            forceY+=force*(dy/distance);
                        }else{
                            forceX=Math.random()*20-10;
                            forceY=Math.random()*20-10;
                        }
                        //continue;
                    }
                    if(node1Name==nodes[i]){
                        node1Name=node2Name;    //node1Name is the one we compare to nodes[i]
                    }
                    //calculate the attraction force
                    const dx = points[i].dx(points[nodeMap.get(node1Name)]);
                    const dy = points[i].dy(points[nodeMap.get(node1Name)]);
                    const distance = points[i].distTo(points[nodeMap.get(node1Name)]);
                    if(distance!=0){
                        const force = k * distance;
                        forceX-=force*(dx/distance);
                        forceY-=force*(dy/distance);
                    }
                    //if it's a parallel node, attract it to its og node
                    if(duplicateEdges.get(j)!=null){
                        node1Name = list[j+2];
                        node1Name = list[j+3];
                        //calculate the attraction force
                        const dx = points[i].dx(points[nodeMap.get(node1Name)]);
                        const dy = points[i].dy(points[nodeMap.get(node1Name)]);
                        const distance = points[i].distTo(points[nodeMap.get(node1Name)]);
                        if(distance!=0){
                            const force = k * distance;
                            forceX-=force*(dx/distance);
                            forceY-=force*(dy/distance);
                        }
                    }
                }

                //repulsion force
                for(let j=0;j<nodes.length;++j){
                    if(i===j) continue;
                    const dx = points[i].dx(points[j]);
                    const dy = points[i].dy(points[j]);
                    const distance = points[i].distTo(points[j]);
                    if(distance!=0){
                        const force = (c*c) / distance;
                        forceX+=force*(dx/distance);
                        forceY+=force*(dy/distance);
                    }else{
                        forceX=Math.random()*20-10;
                        forceY=Math.random()*20-10;
                    }
                }

                //apply forces
                points[i].addi(forceX,forceY);  //maybe make sure the coordinates are within the frame?
                forceX*=damping;
                forceY*=damping;
            }
            //put all parallel components on normal lines
            for (let j=0; j<list.length-4; j+=5) {
                if(list[j]=="voltage1n"||list[j]=="v1n"||list[j]=="g"){continue;}
                if(duplicateEdges.get(j)==null){continue;}
                //the two nodes of the original
                let node1Name = list[j+2];
                let node2Name = list[j+3];
                //console.log(points[nodeMap.get(node1Name)],points[nodeMap.get(node2Name)]);
                //console.log(duplicateEdges.get(j));
                let parallelNode1Name = duplicateEdges.get(j).newNode1;
                let parallelNode2Name = duplicateEdges.get(j).newNode2;

                points[nodeMap.get(parallelNode1Name)].lockTo(points[nodeMap.get(node2Name)],points[nodeMap.get(node1Name)]);
                points[nodeMap.get(parallelNode2Name)].lockTo(points[nodeMap.get(node1Name)],points[nodeMap.get(node2Name)]);

                //after locking, find which point is closer to its parallel node
                //and lock the other point be the same distance (and displacement) from its parallel node
                let dist1=points[nodeMap.get(parallelNode1Name)].distTo(points[nodeMap.get(node2Name)]);
                let dist2=points[nodeMap.get(parallelNode2Name)].distTo(points[nodeMap.get(node1Name)]);
                
                let displacementX;
                let displacementY;
                if(dist1>dist2){
                    displacementX=points[nodeMap.get(parallelNode2Name)].dx(points[nodeMap.get(node1Name)]);
                    displacementY=points[nodeMap.get(parallelNode2Name)].dy(points[nodeMap.get(node1Name)]);
                    points[nodeMap.get(parallelNode1Name)]=points[nodeMap.get(node2Name)].add(displacementX,displacementY);
                }else{
                    displacementX=points[nodeMap.get(parallelNode1Name)].dx(points[nodeMap.get(node2Name)]);
                    displacementY=points[nodeMap.get(parallelNode1Name)].dy(points[nodeMap.get(node2Name)]);
                    points[nodeMap.get(parallelNode2Name)]=points[nodeMap.get(node1Name)].add(displacementX,displacementY)
                }
            }
            
        }
        //normalize the points
        let maxX=-1*Number.MAX_VALUE;
        let maxY=-1*Number.MAX_VALUE;
        let minX=Number.MAX_VALUE;
        let minY=Number.MAX_VALUE;
        for(let i=0; i<points.length;++i){
            minX = Math.min(minX, points[i].x);
            minY = Math.min(minY, points[i].y);
            maxX = Math.max(maxX, points[i].x);
            maxY = Math.max(maxY, points[i].y);
        }
        // Calculate the range of the points in both dimensions
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        //console.log("rangeX: "+rangeX+ " minX: "+minX+" maxX: "+maxX);
        //console.log("rangeY: "+rangeY+" minY: "+minY+" maxY: "+maxY);
        for(let i=0; i<points.length;++i){
            //console.log(points[i]);
            points[i].x=(points[i].x-minX)/rangeX * 800+100;
            points[i].y=(points[i].y-minY)/rangeY * 300+100;
        }
        //make the UIComponents
        for (let i=0; i<list.length-4; i+=5) {
            let type =      list[i  ];
            let name =      list[i+1];
            let node1Name;
            let node2Name;
            let value1 =    list[i+4];
            if(duplicateEdges.get(i)==null){
                node1Name = list[i+2];
                node2Name = list[i+3];
            }else{
                //console.log(duplicateEdges.get(i));
                node1Name = duplicateEdges.get(i).newNode1;
                node2Name = duplicateEdges.get(i).newNode2;
            }

            let c;
            let point1=points[nodeMap.get(node1Name)];
            let point2=points[nodeMap.get(node2Name)];
            //in the case of 1-node voltages or ground, one of the points will be undefined:
            if(point1===undefined){point1=new Point(point2.x,point2.y); point1.addi(0,50);}
            if(point2===undefined){point2=new Point(point1.x,point1.y); point2.addi(0,50);}
            c = new UIComponent(type, point1 ,point2 , value1, name);
            //console.log(c);
            //this._addComponent(c);
            this.components.push(c);
            if(duplicateEdges.get(i)!=null){
                let node1Name2 = list[i+2];
                let node2Name2 = list[i+3];
                c = new UIComponent("wire", point1, points[nodeMap.get(node2Name2)], 0, "");
                //this._addComponent(c);
                this.components.push(c);
                c = new UIComponent("wire", points[nodeMap.get(node1Name2)], point2, 0, "");
                //this._addComponent(c);
                this.components.push(c);
            }
        }

        //I think this is the only way to get nodeMap to work
        //todo: refactor _getCircuitText so that generating the nodeMap is its own method
        this._resetSimulation();
    }

    //occurs when we click Run Simulation while one of the circuit analysis options is selected in the dropdown menu
    circuitAnalysis(){
        //clear all analysis variables
        this.completedComponents=[];
        this.completedNodes=[];
        this.analysisData={
            voltage: NaN, 
            current: NaN,
            startNodeVoltage: NaN,
            endNodeVoltage: NaN,
            voltageHistory: [],
            currentHistory: [],
            resistance: NaN,
            inductance: NaN, 
            capacitance: NaN,
        };
        this.userAnalysis="";
        this.named=[];
        this.loop=[];
        this.loopDirections=[];
        this.selectedComponent=null;

        this.analysisType=document.getElementById("menu").value;
        //all grounds and voltage sources are treated as pre-solved
        for (let i=0; i<this.components.length; i++){
            if(this.components[i].type=="V"||this.components[i].type=="v1n"||this.components[i].type=="voltage1n"||this.components[i].type=="g"){
                this.completedComponents.push(this.components[i]);
                this.completedNodes.push(this.components[i].startNodeName);
                this.completedNodes.push(this.components[i].endNodeName);
            }
            if(this.components[i].type=="v"||this.components[i].type=="v2n"||this.components[i].type=="voltage2n"){
                this.completedComponents.push(this.components[i]);
            }
        }
        this._updateWires();
        if(this.analysisType=="Ohm"||this.analysisType=="Equivalent"){
            //Ohm's law and Equivalent Circuits can jump right into it
            this.userState="userAnalysis";
        }else{
            //Nodal and mesh need to name nodes/loops
            this.userState="naming";
            if(this.analysisType=="Nodal"){
                this.analysisFeedback.push("Double click nodes to name them");
            }else if(this.analysisType=="Mesh"){
                this.analysisFeedback.push("Double click on each component of a loop");
            }
        }
        //run the simulator so we can compare the user inputs to the simulated data
        this.run = true;
    }

    _updateAnalysisData(){
        //this.userAnalysis is user text entry, and we just have to assign it to either a node or a component
        if(this.selectedComponentSegment=="line"){
            this.analysisData.current=Number(this.userAnalysis);
        }else if(this.selectedComponentSegment=="startPoint"){
            this.analysisData.startNodeVoltage=Number(this.userAnalysis);
        }else if(this.selectedComponentSegment=="endPoint"){
            this.analysisData.endNodeVoltage=Number(this.userAnalysis);
        }else{
            console.log(this.selectedComponent,this.selectedComponentSegment);
            console.log("fuck");
        }
    }
    _getSelectedNode(){
        //returns which node is selected in user analysis (if any)
        let selectedNode="-69";
        if(this.selectedComponent!=null){
            if(this.selectedComponentSegment=="startPoint"){
                selectedNode=this.selectedComponent.startNodeName;
            }else if(this.selectedComponentSegment=="endPoint"){
                selectedNode=this.selectedComponent.endNodeName;
            }
        }
        return selectedNode;
    }
    _updateWires(){
        //in user analysis, wires should be complete whenever their respective node is complete
        for (let i=0; i<this.components.length; i++){
            if((this.components[i].type=="w"||this.components[i].type=="wire")&&this.completedNodes.includes(this.components[i].startNodeName)){
                    this.completedComponents.push(this.components[i]);
            }
        }
    }
    _enoughInfoToSolve(){
        if(this.selectedComponentSegment=="line"){
            //component
            //requires both nodal voltages to be solved
            if(this.completedNodes.includes(this.selectedComponent.startNodeName)&&this.completedNodes.includes(this.selectedComponent.endNodeName)){
                return true;
            }
            //alternatively, requires all connected components on one end to be solved (equivalent)
            if (this.analysisType=="Equivalent"){
                //startnode
                let success=false;
                for(let i=0; i<this.components.length; i++){
                    if(this.components[i]==this.selectedComponent) continue;
                    if(this.components[i].startNodeName==this.selectedComponent.startNodeName||this.components[i].endNodeName==this.selectedComponent.startNodeName){
                        if(!this.completedComponents.includes(this.components[i])){
                            success=false;
                            break;
                        }else{
                            success=true;
                        }
                    }
                }
                if(success) return true;
                //endnode
                for(let i=0; i<this.components.length; i++){
                    if(this.components[i]==this.selectedComponent) continue;
                    if(this.components[i].startNodeName==this.selectedComponent.endNodeName||this.components[i].endNodeName==this.selectedComponent.endNodeName){
                        if(!this.completedComponents.includes(this.components[i])){
                            return false;
                        }
                    }
                }
                return true;
            }
        }else{
            //node
            //requires one of its connected components to be solved
            let selectedNode = this._getSelectedNode();
            for (let i=0; i<this.completedComponents.length; i++){
                if((this.completedComponents[i].startNodeName==selectedNode && this.completedNodes.includes(this.completedComponents[i].endNodeName)) || 
                    (this.completedComponents[i].endNodeName==selectedNode && this.completedNodes.includes(this.completedComponents[i].startNodeName))){
                    return true;
                }
            }
        }
        return false;
    }
    _checkCorrectness(matA=null,matB=null){
        //error value is how far off the student can be while still being correct
        //for example, error = 0.1 is 10%
        let error = 0.1;
        if(matA==null){
            //checking the correctness of a component
            if(this.selectedComponentSegment=="line"){
                let compSimulationData = this.circuit.getComponentData(this.selectedComponent.name);
                return isBetween(Math.abs(this.analysisData.current),Math.abs(compSimulationData.current*1000*(1+error)),Math.abs(compSimulationData.current*1000*(1-error)));
            }else{
                let voltage = this.circuit.getNodeVoltage(String(this._getSelectedNode()));
                return isBetween(Number(this.userAnalysis),voltage*(1+error),voltage*(1-error));
            }
        }else{
            //checking the correctness of a matrix
            let matX=Array.from({length:matB.length},(_, index) => index);
            //console.log(matA,matX,matB);
            Gaussian(matA,matX,matB,this.named.length);
            console.log(matX);
            if(this.analysisType=="Nodal"){
                for(let i=0;i<this.named.length;++i){
                    let voltage = this.circuit.getNodeVoltage(String(this.named[i]));
                    //console.log(i," matrix: ",matX[i]," simulation: ",voltage);
                    if(!isBetween(matX[i],voltage*(1+error),voltage*(1-error))){
                        //console.log("matrix failed");
                        return false;
                    }
                }
                return true;
            }else{
                //mesh
                //we could be way more precise about this, but for now, just check if any of the components matches the current
                //just cuz I'm too lazy to add up every loop that goes through a component
                for(let i=0;i<this.named.length;++i){
                    let loopISuccessful = false;
                    for(let j=0;j<this.named[i].length&&!loopISuccessful;++j){
                        let current = Math.abs(this.circuit.getComponentCurrent(this.named[i][j].name));
                        console.log(this.named[i][j].name,current);
                        if(isBetween(matX[i],current*(1+error),current*(1-error))){
                            loopISuccessful=true;
                        }
                    }
                    if(!loopISuccessful){
                        return false;
                    }
                }
                this.named=[];
                return true;
            }
        }
    }
    _showMissingInfo(){
        this.analysisFeedback=[];
        //console.log("user does not have enough info to have this answer");
        this.analysisFeedback.push("Not enough known info");
        //highlight the components we want to point out
        if(this.selectedComponentSegment=="line"){
            //component
            //requires both nodal voltages to be solved
            if(!this.completedNodes.includes(this.selectedComponent.startNodeName)){
                this.highlightedNodes.push(this.selectedComponent.startNodeName);
            }
            if(!this.completedNodes.includes(this.selectedComponent.endNodeName)){
                this.highlightedNodes.push(this.selectedComponent.endNodeName);
            }
            //alternatively, requires all connected components on one end to be solved (kcl)
            
        }else{
            //node
            //requires one of its connected components to be solved
            let selectedNode = this._getSelectedNode();
            for (let i=0; i<this.components.length; i++){
                if(this.completedComponents.includes(this.components[i])) continue;
                if(this.components[i].startNodeName==selectedNode || this.components[i].endNodeName==selectedNode){
                    this.highlightedComponents.push(this.components[i]);
                }
            }
        }
        //console.log(this.highlightedNodes,this.highlightedComponents);
    }
    _giveHints(){
        this.analysisFeedback=[];
        //console.log("wrong answer");
        this.analysisFeedback.push("Incorrect answer");
        if(this.analysisType=="Ohm"){
            //hints for the ohm's law analysis are simple
            //there are only two things to solve
            //1: the single nodal voltage (solved by looking at the voltage source)
            //2: the current across each resistor (solved by using ohm's law)
            if(this.selectedComponentSegment=="line"){
                //2:
                this.analysisFeedback.push("Remember Ohm's law V=IR");
            }else{
                //1:
                this.analysisFeedback.push("Look at the voltage source (watch your signs)");
            }
        }else if (this.analysisType=="Equivalent"){
            //hints for equivalent circuits are also pretty simple
            //there are only a few things to solve
            //1: the equivalent circuit (to find the current through each component)
            //2: how the current splits through each resistor
            //3: nodal voltages (using ohm's law)
            if(this.selectedComponentSegment=="line"){
                //hard to tell whether 1: or 2: went wrong
                //try to handle both?
                this.analysisFeedback.push("First derive the equivalent circuit using the series and parallel rules.");
                this.analysisFeedback.push("Then use the current divider rules.");
            }else{
                //3:
                this.analysisFeedback.push("use Ohm's law to find the nodal voltages (V=IR)");
                //if the person got a nodal voltage attached to the voltage source wrong, that's kinda awkward
            }
        }else if(this.analysisType=="Nodal"){
            this.analysisFeedback.push("Use KCL at each node and convert currents");
            this.analysisFeedback.push("to nodal voltages using Ohm's law");
            //todo: give better feedback
        }
    }
    _circuitIsDone(){
        for(let i=0; i<this.components.length; i++){
            if(!this.completedComponents.includes(this.components[i])){
                return false;
            }
            if(!this.completedNodes.includes(this.components[i].startNodeName)||!this.completedNodes.includes(this.components[i].endNodeName)){
                return false;
            }
        }
        return true;
    }
}



//let circuit = new Circuit("v,v83,0,2,10,g,g473,0,3,0,r,r431,2,0,1000,r,r836,2,0,1000,");
//let circuit = new Circuit("v,v83,0,2,10,g,g473,0,3,0,r,r431,2,4,1000,r,r836,4,0,2000,r,r69,4,5,3000,r,r68,5,0,4000,");
let circuit = new Circuit();
const htmlCanvasElement = document.getElementById("circuitCanvas");
const htmlCanvasElement2 = document.getElementById("feedbackCanvas");
const speedSlider = document.getElementById("simulationSpeedInput");
var gridSize = 20;
const c = new CircuitUI(htmlCanvasElement,htmlCanvasElement2,circuit);

//series
//c.loadFromSave("v,300,280,300,180,10;r,300,180,420,180,1k;r,420,180,420,280,1k;w,420,280,300,280,1;g,300,280,300,320,0;");
//parallel
//c.loadFromSave("v,300,280,300,180,10;w,420,280,300,280,1;g,300,280,300,320,0;r,300,180,420,180,1k;w,420,80,420,180,1;w,420,180,420,280,1;w,300,180,300,80,1;r,300,80,420,80,1k;");
//parallel + series (works)
//c.loadFromSave("v,300,280,300,180,10;w,420,280,300,280,1;g,300,280,300,320,0;r,300,180,420,180,1k;w,420,80,420,180,1;w,300,180,300,80,1;r,300,80,420,80,1k;r,420,180,420,280,1k;");
//c.loadFromSave("v,300,280,300,180,10;r,300,180,420,180,1k;w,420,280,300,280,1;g,300,280,300,320,0;l,420,180,420,280,1m;r,420,180,500,180,1;c,500,180,500,280,1u;w,500,280,420,280,1;");

//c.loadFromSave("v,300,280,300,180,10;r,300,180,420,180,1k;r,420,180,420,280,1k;w,420,280,300,280,1;g,300,280,300,320,0;r,420,180,580,180,1k;w,580,180,580,280,1;w,580,280,420,280,1;");
//c.loadFromSave("v,300,280,300,180,10;r,300,180,300,100,1k;w,420,280,300,280,1;g,300,280,300,320,0;r,300,180,420,180,1k;w,300,100,420,100,1;w,420,100,420,180,1;w,420,180,420,280,1;");


function SimulationSpeedInputChange(e){
    c.numCalculationsPerRender = Math.pow(Number(speedSlider.value),2);
    //console.log("Simulation Calulations per render: " + c.numCalculationsPerRender);
}

let interval = setInterval(update, 100);

function update(){  c.render(); }