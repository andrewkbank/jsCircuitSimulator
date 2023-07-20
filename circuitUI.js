

class Point {
    constructor(x=0, y=0) {
        this.x = Number(x);
        this.y = Number(y);
    }
    roundTo(val = 10){
        this.x = Math.round(this.x/val)*val;
        this.y = Math.round(this.y/val)*val;
        return this;
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
    getHashCode(){
        return this.x*1000000 + this.y;
    }
    fromHashCode(hash, roundTo=1){
        this.x = Math.round((hash/1000000)/roundTo)*roundTo;
        this.y = Math.round((hash - this.x*1000000)/roundTo)*roundTo;
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
    distTo(x,y) {
        if (x instanceof Point){
            y = x.y;
            x = x.x;
        }
        return Math.sqrt( Math.pow(this.x-x, 2) + Math.pow(this.y-y, 2) );
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
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const length = Math.sqrt( Math.pow(endPoint.x-startPoint.x, 2) + Math.pow(endPoint.y-startPoint.y,2) );
    let rotAngle = angle;                
                
    if (rotAngle < 0){  rotAngle += Math.PI*2;  }
    if (rotAngle < Math.PI/2 || rotAngle >= 3*Math.PI/2){   rotAngle = angle;
    } else {    rotAngle = angle+Math.PI;   }

    //ctx.fillStyle = 'rgb(0,0,0)';
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate((startPoint.x+endPoint.x)/2, (startPoint.y+endPoint.y)/2);
    ctx.rotate(rotAngle);
    const voltageAcross = compSimulationData.voltage;
    const currentAcross = compSimulationData.current;
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

    //Displays voltage across the resistor
    ctx.fillText(voltageAcross.toFixed(3)+" V",0,height*3);
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
    ctx.rotate(rotAngle);

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

    ctx.fillText(value, 0,-componentWidth*1.1  );
    ctx.restore();

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


//For each save we do: type, sp.x, sp.y, ep.x, ep.y, valueString,
class UIComponent{
    constructor(type="wire", startPoint=new Point(), endPoint=new Point(100,100), value){
        if (type != null && type.length > 1){   type.toLowerCase(); }

        //allowable types: wire,w, resistor,r, capacitor,c, inductor,i, currentSource,cs, v,voltage2n,v2n, voltage1n,v1n,V,
        this.type = type;
        this.name = this.type[0] + Math.round(Math.random()*1000);
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
    constructor(text="button", startPoint=new Point(), size=new Point(), websiteURL = "", backgroundColor = "grey", textColor = "black", highlightColor = "lightgrey"){
        this.text = text;
        this.startPoint = startPoint;
        this.size = size;
        this.backgroundColor = backgroundColor;
        this.textColor = textColor;
        this.highlightColor = highlightColor;
        this.websiteURL=websiteURL;
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
    redirectToWebsite(){
        //window.location.href = this.websiteURL;
        window.open(this.websiteURL,'_blank');
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
    constructor(htmlCanvasElement){
        //Circuit stuff
        this.components = [];

        //Canvas
        this.htmlCanvasElement = htmlCanvasElement;
        this.ctx = this.htmlCanvasElement.getContext("2d");

        //Rendering variables
        this.backgroundColor = 'rgb(240,240,240)';
        this.defaultStrokeColor = 'rgb(100,100,100)';
        this.defaultStrokeWidth = 2;
        this.defaultFont = '15px sans-serif';
        this.componentWidth = 15;
        this.showNodeVoltages = true;

        //Plot variables
        this.plots = [];

        //buttons
        this.plotComponentButton = new UIButton( "Plot Component", new Point(330,10), new Point(150,30) );
        this.toggleSimulationRunButton = new UIButton( "Run Simulation", new Point(170,10), new Point(150,30));
        this.resetSimulationButton = new UIButton( "Reset Simulation", new Point(10,10), new Point(150,30));
        this.increasePlotTimeScaleButton = new UIButton( "+Time", new Point(), new Point(50,30) );
        this.decreasePlotTimeScaleButton = new UIButton( "-Time", new Point(), new Point(50,30) );
        this.redirectButton = new UIButton("How to use simulation", new Point(500,10), new Point(600,30),"https://docs.google.com/document/d/1Zo0ypoeOjzJ9L55SJJ1NKIb5JLhesanlvxz-toZ5qQY/edit?usp=sharing");
        this.buttons = [this.plotComponentButton, this.toggleSimulationRunButton, this.resetSimulationButton,this.redirectButton];
        
        //Circuit related variables
        this.circuit = new Circuit();
        this.nodeMap = new Map();
        this.editedCircuit = true;    //so we know when we need to update the circuit
        this.run = false;
        this.numCalculationsPerRender = 1000;

        this.userState = 'idle'; //for determining what user input pattern is currently happening

        //mouse moving stuff
        this.mousePos = new Point();
        this.mousePosDelta = new Point();
        this.mouseIsDown = false;

        //misc variables
        this.minimumStateRadius = 10;
        this.pressedKeys = new Map();
        this.selectDistance = 15;

        this._setEventListeners(this);
        this.resize();
    }
    render() {
        if (this.run == true ){
            /*if (this.editedCircuit == true)
            {
                this.circuit = new Circuit( this._getCircuitText() );
                this.editedCircuit = false;
            }*/
            this.circuit.Calculate(this.numCalculationsPerRender);
        }

        const ctx = this.ctx; //this.htmlCanvasElement.getContext('2d');

        //Clear Screen
        ctx.fillStyle = this.backgroundColor;
        ctx.clearRect(0, 0, this.htmlCanvasElement.width, this.htmlCanvasElement.height);
        ctx.fillRect(0, 0, this.htmlCanvasElement.width, this.htmlCanvasElement.height);

        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText("t = " + this.circuit.getCurrentTime().toPrecision(5) + "s", 10, 60);
        
        //Set Default Colors
        ctx.fillStyle = this.defaultStrokeColor;
        ctx.lineWidth = this.defaultStrokeWidth;
        ctx.font = this.defaultFont;

        const color = "black";
        const highlightColor = "blue";

        for (let i=0; i<this.components.length; i++){
            ctx.strokeStyle = color;
            ctx.fillStyle = color;

            const compSimulationData = this.circuit.getComponentData(this.components[i].name);

            if (this.components[i] == this.selectedComponent){
                ctx.strokeStyle = highlightColor;
                if (this.userState == "editingComponentValue"){
                    if (this.components[i].valueIsValid == true){   ctx.fillStyle = "green";
                    } else {    ctx.fillStyle = "red";  }
                }
            }
            this.components[i].render(ctx, this.componentWidth, compSimulationData);
        }
        if (this.showNodeVoltages){
            const keysArray = Array.from( this.nodeMap.keys() );
            for (let i=0; i<keysArray.length; i++){
                const key = keysArray[i];
                const name = this.nodeMap.get(key);
                const point = new Point().fromHashCode(key);
                const voltage = this.circuit.getNodeVoltage(String(name));
                //console.log(10*voltage);
                ctx.fillStyle=styleFromVoltage(voltage);
                //console.log(ctx.fillStyle);
                ctx.beginPath();
                ctx.fillText(voltage.toPrecision(3), point.x+5, point.y-5,);
                ctx.closePath();
            }
        }
        this._renderButtons();
        this._renderPlots();
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
        this.toggleSimulationRunButton.render(this.ctx, this.mousePos);


        //Reset Simulation Button
        if (this.editedCircuit == true){
            this.resetSimulationButton.backgroundColor = falseColor;
            this.resetSimulationButton.highlightColor = falseColorHighlight;
        } else {
            this.resetSimulationButton.backgroundColor = trueColor;
            this.resetSimulationButton.highlightColor = trueColorHighlight;
        }
        this.resetSimulationButton.render(this.ctx, this.mousePos);

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
        this.plotComponentButton.render(this.ctx, this.mousePos);

        this.redirectButton.render(this.ctx,this.mousePos);
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
            //console.log(this.mousePos)
            const distToLine = this.__pointToLineSegmentDistance(this.mousePos, c.startPoint, c.endPoint);
            const distToStartPoint = this.mousePos.distTo(c.startPoint);
            const distToEndPoint = this.mousePos.distTo(c.endPoint);

            //console.log(distToLine);

            if (distToLine < closestDist){
                closestComp = c;
                closestDist = distToLine;
                if (distToLine < distToStartPoint-this.selectDistance && distToLine < distToEndPoint-this.selectDistance){
                    segment = "line";
                } else if (distToStartPoint < distToEndPoint){
                    segment = "startPoint";
                } else {
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

    _addComponent(c){   this.components.push(c);    }

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
        // movingComonent
        // editingComponentValue 
        // finishingEditingComponentValue

        //console.log(this.userState);
        if (event.type == "keydown" && keyPressed == "p"){  console.log(this._getCircuitText());    }
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
                switch(buttonOver){           //plotComponentButtonClicked
                    case this.plotComponentButton: this._addPlot(this.selectedComponent); break;
                    case this.toggleSimulationRunButton:
                        if (this.run == true){
                            this.run = false;
                            this.toggleSimulationRunButton.text = "Run Simulation";
                        } else {
                            this.run = true;
                            this.toggleSimulationRunButton.text = "Stop Simulation";
                        }
                        break;
                    case this.resetSimulationButton: this._resetSimulation(); break;
                    case this.redirectButton: this.redirectButton.redirectToWebsite(); break;
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
            }
            
            //This is used to check if we actually moved the component, or just clicked it. If we just clicked it, then we didn't edit the circuit, thus the circuit was not edited.
            if (event.type == "mousemove"){
                this.movedSelectedComponent = true;
            }
            if (this.selectedComponentSegment == "startPoint"){
                this.selectedComponent.startPoint = this.mousePos.copy();
            } else if (this.selectedComponentSegment == "endPoint"){
                this.selectedComponent.endPoint = this.mousePos.copy();
            } else {
                this.selectedComponent.startPoint.addi(this.mousePosDelta);
                this.selectedComponent.endPoint.addi(this.mousePosDelta);
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

        if (this.userState == "creatingComponent"){
            if (event.type == 'mousedown'){
                this.selectedComponent = new UIComponent(this.componentTypeToDraw);
                this._addComponent(this.selectedComponent);
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
        })
    }

    //Note: loadFromSave, _getCircuitText, and resetSimulation suck
    //Replace with Circuit-centralized system, not a text-based system
    //ie: generate visual components from the stored Circuit instance
    //worry about circuit editing later...

    ///*
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
                c = new UIComponent(a[0], new Point(a[1], a[2]), new Point(a[3], a[4]), a[5], a[6]);
            }

            if (c != null){ this._addComponent(c);  }
        }
        this._resetSimulation();    //calls new Circuit(this._getCircuitText()); 
    }
    /*
    getSaveText(){
        let s = "";
        for (let i=0; i<this.components.length; i++)
        {
            s += this.components[i].toString();
        }
        return s;
    }
    */
    _getCircuitText(){
        //this function is used to convert the UI circuit into a text string the Circuit() class can understand and simulate.
        this.nodeMap = new Map(); //maps position on screen (point.getHashCode()) to node name
        //Andrew's note: where is this.nodeMap set??

        this.nodes = [];
        const nodeMap = this.nodeMap;
        let nodeOn = 0;
        //first, map all of the wire points to nodes.
        for (let i=0; i<this.components.length; i++){
            const c= this.components[i];
            if (!(c.type == "wire" || c.type == "w")) { continue; }

            let sn = nodeMap.get(c.startPoint.getHashCode());
            let en = nodeMap.get(c.endPoint.getHashCode());
            if (sn == null && en == null){ //case 1: both are null - get next node name and set both points to it in the map
                nodeMap.set(c.startPoint.getHashCode(), nodeOn);
                nodeMap.set(c.endPoint.getHashCode(), nodeOn);
                nodeOn += 1;
            } else if (sn == null && en != null){ //case 2 & 3: one is null: set null point to non-null point node.
                nodeMap.set(c.startPoint.getHashCode(), en);
            } else if (sn != null && en == null){
                nodeMap.set(c.endPoint.getHashCode(), sn);
            } else {                //Case 4: both are not null - take the smallest node, and set all of the larger ones to it.
                //both are not null;
                if (sn == en){
                    //do nothing..?
                } else {
                    const keysArray = Array.from( nodeMap.keys() );
                    if (sn < en){
                        //convert all en to sn
                        for (let k=0; k<keysArray.length; k++){
                            if (nodeMap.get(keysArray[k]) == en){
                                nodeMap.set(keysArray[k], sn);
                            }
                        }
                    } else {
                        //convert all sn to en
                        for (let k=0; k<keysArray.length; k++){
                            if (nodeMap.get(keysArray[k]) == sn){
                                nodeMap.set(keysArray[k], en);
                            }
                        }
                    }
                }
            }
            
        }

        //next, map all other component points to nodes.
        for (let i=0; i<this.components.length; i++){
            const c = this.components[i];
            if (c.type == "w" || c.type == "wire") { continue; }

            //get sn name from map. if null, create new node. after, set c.startNodeName to the node value; repeat for endnode
            let sn = nodeMap.get(c.startPoint.getHashCode());
            if (sn == null){
                nodeMap.set(c.startPoint.getHashCode(), nodeOn);
                nodeOn += 1;
            }
            c.startNodeName = nodeMap.get(c.startPoint.getHashCode());


            let en = nodeMap.get(c.endPoint.getHashCode());
            if (en == null){
                nodeMap.set(c.endPoint.getHashCode(), nodeOn);
                nodeOn += 1;
            }
            c.endNodeName = nodeMap.get(c.endPoint.getHashCode());

        }

        //now, we have mapped all of the components to nodes.
        let s = ""; //format: type, name, node1Name, node2Name, value, ... 
        for (let i=0; i<this.components.length; i++){
            const c = this.components[i];
            if (c.type == "w" || c.type == "wire") { continue; }

            s += c.type+","+c.name+","+c.startNodeName+","+c.endNodeName+","+c.value+",";
        }
        //console.log(s);
        return s;
    }
    _resetSimulation(){
        this.circuit = new Circuit(this._getCircuitText()); 
        this.editedCircuit = false;
    }
}




const htmlCanvasElement = document.getElementById("circuitCanvas");
const speedSlider = document.getElementById("simulationSpeedInput");
var gridSize = 20;
const c = new CircuitUI(htmlCanvasElement);

//series
//c.loadFromSave("v,300,280,300,180,10;r,300,180,420,180,1k;r,420,180,420,280,1k;w,420,280,300,280,1;g,300,280,300,320,0;");
//parallel
c.loadFromSave("v,300,280,300,180,10;w,420,280,300,280,1;g,300,280,300,320,0;r,300,180,420,180,1k;w,420,80,420,180,1;w,420,180,420,280,1;w,300,180,300,80,1;r,300,80,420,80,1k;");
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