function closeTo(num1, num2, threshold = 0.001){
    if (num1-threshold < num2 && num1+threshold > num2){    return true;    }
    if (isNaN(num1) && isNaN(num2)){    return true;    }
    return false;
}
function copy(array){
    let newArray = [];
    for (let i=0; i<array.length; i++){
        newArray.push(array[i]);
    }
    return newArray;
}

class Node {
    constructor(name = 'any', number = 0) {
        this.name = name;
        this.number = number;
        this.endComponents = [];
        this.startComponents = [];
        this.voltage = 0;
        this.currentIn = 0;
    }
    toString(){
        let s = "Node - name: " + this.name + " number: " + this.number;
        s += "\n   strt.Comps: ";
        for (let i=0; i<this.startComponents.length; i++){
            s += this.startComponents[i].name +", ";
        }
        s += "\n   end.Comps: ";
        for (let i=0; i<this.endComponents.length; i++){
            s += this.endComponents[i].name +", ";
        }
        s += "\n   voltage:" + this.voltage;
        return s;
    }
}
class Component {
    constructor(name, startNode, endNode){
        this.name = name;
        this.startNode = startNode;
        this.endNode = endNode;

        this.voltage = NaN;
        this.current = NaN;
        this.inductance = NaN;
        this.capacitance = NaN;
        this.resistance = NaN;

        this.voltageHistory = [];
        this.currentHistory = [];
    }
    setValue(value) {
        console.error("this compoinent.setValue not implemented");
    }
    getVoltage(){   return this.voltage;    }
    getCurrent(){   return this.current;    }
}
class Resistor extends Component {
    constructor(name, startNode, endNode, resistance=1000){
        super(name, startNode, endNode);
        this.resistance = resistance;
    }
    setValue(value){
        if (isNaN(value)) { return; }
        this.resistance = value;
    }
}
class CurrentSource extends Component {
    constructor(name, startNode, endNode, current){
        super(name, startNode,endNode);
        this.current = current;
    }
    setValue(value){
        if (isNaN(value)) { return; }
        this.current = value;
    }
}
class Inductor extends CurrentSource {
    constructor(name, startNode, endNode, inductance){
        super(name, startNode,endNode);
        this.inductance = inductance;
        this.current = 0;
    }
    setValue(value){
        if (isNaN(value)) { return; }
        this.inductance = value;
    }
}

class VoltageSource extends Component {
    constructor(name, startNode, endNode, voltage=10){
        super(name, startNode, endNode);
        this.voltage = voltage;
    }
    setValue(value){
        if (isNaN(value)) { return; }
        this.voltage = value;
    }
}

//why not just use VoltageSource instead of Voltage2n and Voltage1n?
class Voltage2n extends VoltageSource {
    
}
class Voltage1n extends VoltageSource {

}
class Capacitor extends Voltage2n {
    constructor(name, startNode, endNode, capacitance){
        super(name, startNode, endNode);
        this.capacitance = capacitance;
        this.voltage = 0;
    }
    setValue(value){
        if (isNaN(value)) { return; }
        this.capacitance = value;
    }
}

class Diode extends Resistor {
    constructor(name, startNode, endNode, thresholdVoltage=10){
        super(name, startNode, endNode);
        this.thresholdVoltage = thresholdVoltage;
        this.resistance = 1000000000;
        this.avgCurrent = 0;
        this.avgVoltage = 0;
    }
    setValue(value){
        if (isNaN(value)) { return; }
        this.thresholdVoltage = thresholdVoltage;
    }
    getVoltage(){   return this.avgVoltage; }
    getCurrent(){   return this.avgCurrent; }
}


//I'm not really sure what type of update this function does... -Andrew
function updateMatrix(matA, matX, matB){
    //console.log("before updateMatrix:");
    //printMatrix(matA);
    //printMatrix(matX);
    //printMatrix(matB);
    for (let i=0; i<matX.length; i++){
        const nodeVal = matX[i];
        if (isNaN(nodeVal)) { continue; }

        for (let r=0; r<matB.length; r++){
            //clear row (matA)
            matA[i*matB.length + r] = 0;

            //clear column (matA -> matB)
            matB[r] -= matA[r*matB.length + i] * nodeVal;
            matA[r*matB.length + i] = 0;
        }
        matB[i] = 0; //clear row (matB)
    }
    //console.log("after updateMatrix:");
    //printMatrix(matA);
    //printMatrix(matX);
    //printMatrix(matB);
    //console.log("----------------------");
}
function printMatrix(mat, rowLength=3){
    let s = "";
    for (let i=0; i<mat.length/rowLength; i++){
        for (let j=0; j<rowLength; j++){
            if(mat[i*rowLength+j]==null){
                s+="null";
            }else{
                s += mat[i*rowLength + j].toFixed(3);
            }
            s+= "    ";
        }
        s += "\n";
    }
    console.log(s);
}
//Gaussian Elimination
function Gaussian(matA, matX, matB, rowLength=3){
    let numRows = matA.length/rowLength;
    //console.log("numRows: " + numRows + "  rowLen: "+rowLength );
 
    for (let c=0; c<rowLength; c++){
        //console.log("Inter Loop:  c:" + c+"  numRows-c-1:"+(numRows-c-1));
        for (let r=numRows-1; r > c; r-=1){
            //console.log("r:" + r +"  c: " + c);
            const v1 = matA[r*rowLength + c];
            if (v1 == 0) { 
                //console.log("Continuing1");
                continue; 
            }

            //Find r2, the next row with a value in column c above row r
            let r2 = r-1;
            while ( r2 >= 0 && (matA[r2*rowLength + c] == 0 || isNaN(matA[r2*rowLength + c]))){
                r2 -= 1;
            }
            if ((matA[r2*rowLength + c] == 0 || isNaN(matA[r2*rowLength + c]))){
                //console.log("continuing2");
                continue;
            }

            //Now we can define v2 and our multiplier
            const v2 = matA[r2*rowLength + c];
            const multiplier = -v1/v2;

            //console.log("r: " + r + "  c: " + c + "  r2: " +r2 + "  v1:" + v1 + " v2:"+v2 + "  mp: " + multiplier);

            //Merge rows together (r2 into r)
            for (let c2=c; c2<rowLength; c2++){
                matA[r*rowLength + c2] += matA[r2*rowLength + c2]*multiplier;
            }
            matB[r] += matB[r2]*multiplier;
            //console.log(r,c);
        }
    }

    for (let c=numRows-1; c >=0; c-=1){
        if (matA[c*numRows + c] == 0) { continue; }
        matX[c] = matB[c]/matA[c*numRows + c];
        for (let r=0; r<c; r++){
            matB[r] -= matA[r*numRows + c]*matX[c];
            matA[c*numRows + r] = 0;
        }
        matB[c] = 0;
    }
    /*
    //printMatrix(matA, rowLength);
    //printMatrix(matX, 1);
    //printMatrix(matB, 1);
    */
}

/*
circuit format:

type, name, node1Name, node2Name, value, type, name, value, ..., type

type acceptible values: r, resistor, 
                        c, capacitor, 
                        i, inductor, 
                        v1n, voltage1n, v,
                        v2n, voltage2n, V,
                        cs, currentSource,
*/
class Circuit{
    constructor(circuitString = "", timeStep = 0.000000001){
        this.nodes;         //array of node objects
        this.nodeMap;       //Map to get node by Node Name  (note: not Number)   //key = nodeName  value = nodeObject
        this.components;    // = components;//circ1.components;
        this.componentMap;   //Map key=comp name, value= component object

        this.timeStep = timeStep; // 1ns simulation time step
        this.timeSinceStart = 0; //in seconds

        // following are set in this._CreateComponentGroupings
        this.resistiveComponents = []; // all resistors
        this.currentComponents = []; //current sources and inductors
        this.voltage1nComponents = []; // all voltage1n components
        this.voltage2nComponents = []; //all voltage2n components
        this.varyingComponents = []; //all Capacitors, Inductors, and other varying components (change value every tick)

        this._LoadFromString(circuitString);
        this._CreateComponentGroupings();
        //this._MapComponentsAndNodes();
    }
    _LoadFromString(string) {
        this.nodes = [];
        this.components = [];
        this.nodeMap = new Map();          //nodeMap allows for us to quickly search for nodes by name;
            //maps string name to node object
        this.componentMap = new Map();

        //Remove all spaces, returns, etc from string, and convert to a list
        string = string.split(' ').join('');
        string = string.split('\n').join('');
        string = string.split('\r').join('');
        string = string.toLowerCase();

        const list = string.split(',');
        let nodeOn = 0;

        
        for (let i=0; i<list.length-4; i+=5) {
            let type =      list[i  ];
            let name =      list[i+1];
            let node1Name = list[i+2];
            let node2Name = list[i+3];
            let value1 =    list[i+4];
            //let value2 =    list[i+5];
            ////////////////////////////////////////////////////////////////////////////////////////
            //get or create the nodes
            let node1 = this.nodeMap.get(node1Name);
            if (node1 == null){
                node1 = new Node(node1Name, nodeOn);
                this.nodes.push(node1);
                this.nodeMap.set(node1Name, node1);
                nodeOn += 1;
            }

            let node2 = this.nodeMap.get(node2Name);
            if (node2 == null){
                node2 = new Node(node2Name, nodeOn);
                this.nodes.push(node2);
                this.nodeMap.set(node2Name, node2);
                nodeOn += 1;
            }

            //create the component
            let comp;
            //console.log("Creating component: type:" + type + " name:" + name + " n1:" + node1Name + " n2:" + node2Name + " value1:" +value1);
            switch (type){
                case 'r':
                case 'resistor': comp = new Resistor(name, node1, node2, Number(value1)); break;
                case 'c':
                case 'capacitor': comp = new Capacitor(name, node1, node2, Number(value1)); break;
                case 'l':
                case 'inductor': comp = new Inductor(name, node1, node2, Number(value1)); break;
                case 'v1n':
                case 'voltage1n':
                case 'V':
                case 'g': comp = new Voltage1n(name, node1, node2, Number(value1)); break; 
                case 'v2n':
                case 'voltage2n':
                case 'v': comp = new Voltage2n(name, node1, node2, Number(value1)); break; //note: value1 for Voltage2n doesn't work
                case 'i':
                case 'cs':
                case 'currentSource': comp = new CurrentSource(name, node1, node2, Number(value1)); break;
                case 'd': 
                case 'diode': comp = new Diode(name, node1, node2, Number(value1)); break;
                default: console.error("UNKNOWN COMP: type:" + type + "  name: " + name); break;
            }

            //console.log(comp, value1);

            if (comp != null) {
                this.components.push(comp);
                this.componentMap.set(comp.name, comp);
                node1.startComponents.push(comp);
                if (!(comp instanceof Voltage1n)){  node2.endComponents.push(comp); }
            }
        }
        this._CreateComponentGroupings();
    }
    _CreateComponentGroupings(){
        this.resistiveComponents = [];
        this.currentComponents = [];
        this.voltage1nComponents = [];
        this.voltage2nComponents = [];
        this.varyingComponents = [];

        for (let i=0; i<this.components.length; i++){
            const c = this.components[i];
            if (c instanceof Resistor){ this.resistiveComponents.push(c);   }
            if (c instanceof Voltage1n){    this.voltage1nComponents.push(c);   }
            if (c instanceof Voltage2n){    this.voltage2nComponents.push(c);   }
            if (c instanceof Capacitor){    this.varyingComponents.push(c); }
            if (c instanceof CurrentSource){    this.currentComponents.push(c); }
            if (c instanceof Inductor){ this.varyingComponents.push(c); }
            if (c instanceof Diode){    this.varyingComponents.push(c); }
        }
    }
    Calculate(numCycles = 1, debugMode = false){
        if (debugMode){ return this._CalculateNodeVoltages();   }

        for (let i=0; i<numCycles; i++){
            this.timeSinceStart += this.timeStep;
            this._CalculateNodeVoltages();
            if (this._CalculateCurrents() == false){    break;  }
            this._CalculateVoltages();
            this._UpdateDynamicComponents();
            this._SaveHistory();
        }
    }
    _CalculateNodeVoltages(){
        const components = this.components;
        const nodes = this.nodes;

        //RESET//////////////////////////////////
        //Reset all currents and voltages in components 
        for (let i=0; i<components.length; i++){
            const c = components[i];
            if (c instanceof VoltageSource){
                c.current = NaN;
            } else if (c instanceof CurrentSource){
                c.voltage = NaN;
            } else {
                c.voltage = NaN;
                c.current = NaN;
            }
        }

        //CALCULATE//////////////////////////////////
        //Create matrices
        const matA = []; //creating matrix. form: row#*rowLength + column#,   rowLength = nodes.length,   num rows = nodes.length + numVoltageSources
        const matX = [];
        const matB = [];
        const rowLength = nodes.length;
        for (let i=0; i<rowLength; i++){
            for (let j=0; j<rowLength; j++){
                matA.push(0);
            }
            matB.push(0);
            matX.push(NaN);
        }

        //Load matrices (matA) with resistive loads
        for (let i=0; i<this.resistiveComponents.length; i++){
            const c = this.resistiveComponents[i];
            const sn = c.startNode.number;
            const en = c.endNode.number;

            matA[sn*rowLength + sn] += 1/c.resistance;
            matA[sn*rowLength + en] -= 1/c.resistance;
            matA[en*rowLength + en] += 1/c.resistance;
            matA[en*rowLength + sn] -= 1/c.resistance;
        }

        //load matrices (matB) with inductive/current components
        for (let i=0; i<this.currentComponents.length; i++){
            const c = this.currentComponents[i];
            const sn = c.startNode.number;
            const en = c.endNode.number;    
            matB[sn] += c.current;
            matB[en] -= c.current;
        }



        //APPLYING VOLTAGES///////////////////////////////
        //Apply Voltage1n components (known node voltages) to the matrix
        for (let i=0; i<this.voltage1nComponents.length; i++){
            const c = this.voltage1nComponents[i];
            matX[c.startNode.number] = c.voltage;
        }
        if (this.voltage1nComponents.length == 0 && this.voltage2nComponents.length > 0){
            const c = this.voltage2nComponents[0];
            matX[c.startNode.number] = -c.voltage/2;
            matX[c.endNode.number] = c.voltage/2;
        }
        updateMatrix(matA, matX, matB);

        //Apply Voltage2n components (known voltages between nodes) to the matrix
        //2 Cases: Case 1: if one node from the Voltage2n component is already known, then we know the other node value
        //         Case 2: We do not know any voltages, but we can take the startNode row and add it to the endNode row. 
        //                 Then, in the startNode row we add a new equation showing the relationship between startNode and endNode
        const intoMap = new Map(); //see inside for use info
        for (let i=0; i<this.voltage2nComponents.length; i++){
            const c = this.voltage2nComponents[i];
            const sn = c.startNode.number;
            let en = c.endNode.number;

            //if the start node is not NaN (already known), just fill in end node and clear the row
            if (!isNaN(matX[sn]) && isNaN(matX[en])){
                matX[en] = matX[sn] + c.voltage;
                updateMatrix(matA, matX, matB, en);
                i = -1;//restart - might simplify our life
            } else if (!isNaN(matX[en]) && isNaN(matX[sn])){ //if the end node is not NaN
                matX[sn] = matX[en] - c.voltage;
                updateMatrix(matA, matX, matB, sn);
                i = -1; //restart - might simplify our life
            } else if (isNaN(matX[en]) && isNaN(matX[sn])){ //if both nodes are NaN...
                //Check to see if en was the sn for a difference Voltage2n. if it was, then ret will not be null.
                const ret = intoMap.get(en);
                let v = c.voltage;
                if (ret != null){
                    en = ret.en;
                    v += ret.v;
                }

                //Save the mapping from sn to en, and also save the voltage difference between those two nodes.
                // We will need this, so if we have another Voltage2n merging into sn row, we will instead merge into en row and adjust the voltage difference.
                intoMap.set(sn, {en:en, v:v});

                //combine row sn into row en
                for (let col=0; col<rowLength; col++){
                    matA[en*rowLength + col] += matA[sn*rowLength + col];
                    matA[sn*rowLength + col] = 0;
                }
                matB[en] += matB[sn];

                matA[sn*rowLength + en] = 1;
                matA[sn*rowLength + sn] = -1;
                matB[sn] = v;
            }
        }

        //GAUSSIAN ELIMINATION//////////////////////////////
        Gaussian(matA, matX, matB, rowLength);
        for (let i=0; i<nodes.length; i++){
            nodes[i].voltage = matX[i];
        }
        //printMatrix(matX, 1);
        return matX;
    }
    _CalculateCurrents() {
        //Clearing currentIn for nodes and .current for all non-current dependent components
        for (let i=0; i<this.nodes.length; i++){
            this.nodes[i].currentIn = 0;
        }
        for (let i=0; i<this.components.length; i++){
            const c = this.components[i];
            if (!(c instanceof CurrentSource)){
                c.current = NaN;
                if (c instanceof Resistor){ //ohm's law for resistors
                    c.current = (c.startNode.voltage - c.endNode.voltage)/c.resistance;
                    c.startNode.currentIn -= c.current;
                    c.endNode.currentIn += c.current;
                    //console.log(c.current);
                }
                if(c instanceof Voltage1n){ //singular nodes don't have current
                    c.current=0;
                    c.startNode.currentIn=0;
                    c.endNode.currentIn=0;
                }
            }
        }

        //for each node, if there's 1 unknown current, we know the current and should set it
        let foundUnsolvableNode = true; //this variable stores if we have a node left with TWO unknown currents. if so, keep looping.
        let loopNum = 0;
        const maxNumLoops = 20;
        //const maxNumLoops=this.nodes.length;
        while (foundUnsolvableNode == true && loopNum < maxNumLoops){
            loopNum += 1;

            //for each node, check if there's 1 component with an unknown current.
            for (let k=0; k<this.nodes.length; k++){
                const n = this.nodes[k];

                let numUnknownComponents = 0;
                let unknownComponentStartsAtCurrentNode = false;
                let unknownComponent = null;
                let tempComp = null;
                //count number of unknown components in startComponents AND endComponents
                for (let i=0; i<n.startComponents.length; i++){
                    tempComp = n.startComponents[i];
                    if (isNaN(tempComp.current)){
                        unknownComponent = tempComp;
                        unknownComponentStartsAtCurrentNode = true;
                        numUnknownComponents += 1;
                        if (numUnknownComponents > 1){  break;  }
                    }
                }
                if (numUnknownComponents > 1) { foundUnsolvableNode = true; continue;}
                for (let i=0; i<n.endComponents.length; i++){
                    tempComp = n.endComponents[i];
                    if (isNaN(tempComp.current)){
                        unknownComponent = tempComp;
                        unknownComponentStartsAtCurrentNode = false;
                        numUnknownComponents += 1;
                        if (numUnknownComponents > 1){  break;  }
                    }
                }
                if (numUnknownComponents == 1){ //if there's only 1 unknown current...
                    //console.log("n: " + n.name + "  c: " + unknownComponent.name);
                    if (unknownComponentStartsAtCurrentNode){   //Andrew's Note: This is REALLY buggy, have to fix later
                        unknownComponent.current = -unknownComponent.endNode.currentIn;
                    } else {
                        unknownComponent.current = unknownComponent.startNode.currentIn;
                    }
                    unknownComponent.endNode.currentIn = 0;
                    unknownComponent.startNode.currentIn = 0;
                    foundUnsolvableNode=false;
                }
            }
        }
        if (loopNum == maxNumLoops){
            console.log(this.nodes);
            console.error("Circuit._CalculateCurrents(): Error - Looping to "+maxNumLoops+"... shouldn't ever loop this much.");
            return false;
        }
        /*
        let s = "";
        for (let i=0; i<this.components.length; i++){
            const c = this.components[i];
            s += "name: "+c.name + "   current: "+c.current+"\n";
        }
        console.log(s);//*/
    }
    _CalculateVoltages() {
        //for each component
        for (let i=0; i<this.components.length; i++){
            const c = this.components[i];
            if (c instanceof VoltageSource){
                continue;
            }
            c.voltage = c.startNode.voltage - c.endNode.voltage;
        }
    }
    _UpdateDynamicComponents() {

        for (let i=0; i<this.varyingComponents.length; i++){
            const c = this.varyingComponents[i];
            if (c instanceof Capacitor){    c.voltage -= this.timeStep * c.current/c.capacitance;   }
            if (c instanceof Inductor){ c.current -= this.timeStep * c.voltage/c.inductance;    }
            if (c instanceof Diode){    //I'm not really sure how diodes work, but some of this seems weird... -Andrew
                //curve: 
                const I_0 = 0.0000000000001;
                const v_t = 0.026;
                // current = I_0 * e ^ (voltage / v_t);
                const wantedCurrent = I_0 * Math.pow(2.7182818, c.voltage/v_t);
                //  c.current = c.voltage / c.resistance;
                //  c.wantedCurrent = c.voltage / c.newResistance;
                // c.resistance = Math.max(0.01, c.voltage/wantedCurrent);

                if (c.current > wantedCurrent && c.resistance < 1000000000){    c.resistance *= 1.01;
                } else if (c.resistance > 1) { c.resistance *= 0.987;   }
                c.avgVoltage = c.avgVoltage * 0.9 + c.voltage*0.1;
                c.avgCurrent = c.avgCurrent * 0.9 + c.current*0.1;
            }  
        }
    }
    _SaveHistory() {
        //we only want to save data every 1uS
        let val = this.timeSinceStart*1000000
        if (closeTo(val, Math.round(val),this.timeStep*100000) == false){   return; }
        for (let i=0; i<this.components.length; i++){
            const c = this.components[i];
            c.voltageHistory.push(c.getVoltage());
            c.currentHistory.push(c.getCurrent());
        }
    }

    getComponentVoltage(componentName){
        const comp = this.componentMap.get(componentName);
        if (comp != null){  return comp.getVoltage();   }
    }
    getNodeVoltage(nodeName){   return this.nodeMap.get(nodeName)?.voltage  }
    getComponentCurrent(componentName){
        const comp = this.componentMap.get(componentName);
        if (comp != null){  return comp.getCurrent();   }
    }
    getComponentValue(componentName, valueType=""){
        const comp = this.componentMap.get(componentName);
        if (comp == null){  return null;    }
        switch (valueType.toLowerCase()){
            case "voltage": return comp.getVoltage();
            case "current": return comp.getCurrent();
            case "resistance": return comp.resistance;
            case "inductance": return comp.inductance;
            case "capacitance": return comp.capacitance;
        }
    }
    getComponentData(componentName){
        const comp = this.componentMap.get(componentName);
        if (comp == null){
            return {
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
        }
        return {
            voltage: comp.getVoltage(), 
            current: comp.getCurrent(),
            startNodeVoltage: comp.startNode.voltage,
            endNodeVoltage: comp.endNode.voltage,
            voltageHistory: comp.voltageHistory,
            currentHistory: comp.currentHistory,
            resistance: comp.resistance,
            inductance: comp.inductance, 
            capacitance: comp.capacitance,
        };
    }
    setComponentValue(componentName, value) {
        for (let i=0; i<this.components.length; i++) {
            const c = this.components[i];
            if (c.name == componentName){
                c.setValue(value);
                return;
            }
        }
    }
    getCurrentTime(){   return this.timeSinceStart; }
    getVoltageData(){
        console.error("Circuit.getVoltageData() not implemented.")
        this.nodeMap;        //key = nodeName  value = nodeObject
           
        this.componentMap;  //Map key=comp.name, value= component object
        this.componentMap.set(comp.name, comp);

        //what we want is to return a map that maps key=node or component name to value=node or component voltage
    }
}
