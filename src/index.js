import * as PIXI from 'pixi.js';
const canvasDOM = document.getElementById("viewerCanvas");
let density = window.devicePixelRatio || 1;
let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;

let touchType;
if ('ontouchstart' in window) {
    touchType = "touchstart";
} else {
    touchType = "click";
}

let goTime = false;
let first = true;
let spinRequested = false;
let spinning = false;
let stopping = false;
let done = false;
let processed = false;
let positionData;
let data;
let targetPos;
let passed = false;

const app = new PIXI.Application({
    view: viewerCanvas,
    resolution: density,
    autoDensity: true,
    antialias: true,
    transparent: true,
    width: innerWidth,
    height: innerHeight
});

app.stop();
app.renderer.autoResize = true;
app.renderer.resize(innerWidth, innerHeight);
app.loader.add([
    {name: 'headerBack', url: 'src/images/header.png'},
    {name: 'showdownOff', url: 'src/images/showdown-off.png'},
    {name: 'spinnerButton', url: './src/images/btn-spin.png'},
    {name: 'spinnerWheel', url: './src/images/wheel.png'},
    {name: 'btnShadow', url: './src/images/btn-shadow.png'},
    {name: 'spinnerShadow', url: './src/images/wheel-shadow.png'},
    {name: 'spinnerMarker', url: './src/images/marker.png'},
    {name: 'boltOn', url: './src/images/bolt@2x.png'},
    {name: 'mustDrop', url: './src/images/must_drop.png'},
    {name: 'slots', url: './src/images/slots@2x.png'},
    {name: 'vegas', url: './src/images/vegas@2x.png'},
    {name: 'sLet', url: './src/images/s@2x.png'},
    {name: 'hLet', url: './src/images/h@2x.png'},
    {name: 'o1Let', url: './src/images/o-1@2x.png'},
    {name: 'w1Let', url: './src/images/w-1@2x.png'},
    {name: 'dLet', url: './src/images/d@2x.png'},
    {name: 'o2Let', url: './src/images/o-2@2x.png'},
    {name: 'w2Let', url: './src/images/w-2@2x.png'},
    {name: 'nLet', url: './src/images/n@2x.png'}
]).on("progress", loadProgressHandler).load(spriteSetup);

const stage = new PIXI.Container();
stage.width = app.renderer.width;
stage.height = app.renderer.height;
app.stage.addChild(stage);

let headerBox;
let headerAnimationBox;
let headerSprite;
let showdownOffSprite;

let spinnerBox;
let buttonShadow;
let wheelShadow;
let buttonSprite;
let wheelSprite;
let wheelRotation = 0;
let markerSprite;
let markerRotation = 0.75;

let vegasSprite;
let vegasAlpha = 0;
let slotsSprite;
let slotsAlpha = 0;
let boltOnSprite;
let boltOnAlpha = 0;

let sLetSprite;
let sLetAlpha = 0;
let hLetSprite;
let hLetAlpha = 0;
let o1LetSprite;
let o1LetAlpha = 0;
let w1LetSprite;
let w1LetAlpha = 0;
let dLetSprite;
let dLetAlpha = 0;
let o2LetSprite;
let o2LetAlpha = 0;
let w2LetSprite;
let w2LetAlpha = 0;
let nLetSprite;
let nLetAlpha = 0;

let mustDropSprite;
let mustDropAlpha = 0;

let sceneTimer = 0;
let salt = Math.random();
let rando = Math.random();
let wheelHook = false;
let base = 1;

function spriteSetup() {
    // carryover
    if (!first) {
        vegasAlpha = vegasSprite.alpha;
        slotsAlpha = slotsSprite.alpha;
        boltOnAlpha = boltOnSprite.alpha;

        sLetAlpha = sLetSprite.alpha;
        hLetAlpha = hLetSprite.alpha;
        o1LetAlpha = o1LetSprite.alpha;
        w1LetAlpha = w1LetSprite.alpha;
        dLetAlpha = dLetSprite.alpha;
        o2LetAlpha = o2LetSprite.alpha;
        w2LetAlpha = w2LetSprite.alpha;
        nLetAlpha = nLetSprite.alpha;

        mustDropAlpha = mustDropSprite.alpha;

        wheelRotation = wheelSprite.rotation;
        markerRotation = markerSprite.rotation;
    }
    // new sprites and containers
    headerBox = new PIXI.Container();
    headerAnimationBox = new PIXI.Container();
    headerSprite = new PIXI.Sprite(app.loader.resources.headerBack.texture);
    showdownOffSprite = new PIXI.Sprite(app.loader.resources.showdownOff.texture);

    spinnerBox = new PIXI.Container();
    buttonShadow = new PIXI.Sprite(app.loader.resources.btnShadow.texture);
    wheelShadow = new PIXI.Sprite(app.loader.resources.spinnerShadow.texture);
    buttonSprite = new PIXI.Sprite(app.loader.resources.spinnerButton.texture);
    wheelSprite = new PIXI.Sprite(app.loader.resources.spinnerWheel.texture);
    wheelSprite.rotation = wheelRotation;
    markerSprite = new PIXI.Sprite(app.loader.resources.spinnerMarker.texture);
    markerSprite.rotation = markerRotation;


    vegasSprite = new PIXI.Sprite(app.loader.resources.vegas.texture);
    vegasSprite.alpha = vegasAlpha;
    slotsSprite = new PIXI.Sprite(app.loader.resources.slots.texture);
    slotsSprite.alpha = slotsAlpha;
    boltOnSprite = new PIXI.Sprite(app.loader.resources.boltOn.texture);
    boltOnSprite.alpha = boltOnAlpha;


    sLetSprite = new PIXI.Sprite(app.loader.resources.sLet.texture);
    sLetSprite.alpha = sLetAlpha;
    hLetSprite = new PIXI.Sprite(app.loader.resources.hLet.texture);
    hLetSprite.alpha = hLetAlpha;
    o1LetSprite = new PIXI.Sprite(app.loader.resources.o1Let.texture);
    o1LetSprite.alpha = o1LetAlpha;
    w1LetSprite = new PIXI.Sprite(app.loader.resources.w1Let.texture);
    w1LetSprite.alpha = w1LetAlpha;
    dLetSprite = new PIXI.Sprite(app.loader.resources.dLet.texture);
    dLetSprite.alpha = dLetAlpha;
    o2LetSprite = new PIXI.Sprite(app.loader.resources.o2Let.texture);
    o2LetSprite.alpha = o2LetAlpha;
    w2LetSprite = new PIXI.Sprite(app.loader.resources.w2Let.texture);
    w2LetSprite.alpha = w2LetAlpha;
    nLetSprite = new PIXI.Sprite(app.loader.resources.nLet.texture);
    nLetSprite.alpha = nLetAlpha;

    mustDropSprite = new PIXI.Sprite(app.loader.resources.mustDrop.texture);
    mustDropSprite.alpha = mustDropAlpha;

    // modify
    headerBox.width = innerWidth;
    headerBox.height = innerHeight*0.4;
    headerBox.pivot.x = (innerWidth)/2;
    headerBox.pivot.y = (innerHeight*0.4)/2;
    moveHeaderToTop(headerBox);
    
    headerSprite.anchor.set(0.5);
    if (innerWidth < 600) {
        headerSprite.width = innerWidth*1.5;
    } else if (innerWidth < 900) {
        headerSprite.width = innerWidth*1.2;
    } else {
        headerSprite.width = innerWidth;
    }
    
    headerSprite.height = innerHeight*0.4;
    let currentCenterX = (innerWidth)/2;
    let currentCenterY = (innerHeight)/2;
    headerSprite.position.set(currentCenterX,currentCenterY);

    centerAtMiddle(headerAnimationBox);

    showdownOffSprite.anchor.set(0.5);
    keepLightsScaled(showdownOffSprite);

    boltOnSprite.anchor.set(0.5);
    alignToSign(boltOnSprite, showdownOffSprite, 0.05, -0.37, 1);

    vegasSprite.anchor.set(0.5);
    alignToSign(vegasSprite, showdownOffSprite, -0.49, -0.33, 1);

    slotsSprite.anchor.set(0.5);
    alignToSign(slotsSprite, showdownOffSprite, 0.59, -0.33, 1);


    sLetSprite.anchor.set(0.5);
    alignToSign(sLetSprite, showdownOffSprite, -1.01, 0.1, 1);

    hLetSprite.anchor.set(0.5);
    alignToSign(hLetSprite, showdownOffSprite, -0.7, 0.1, 1);

    o1LetSprite.anchor.set(0.5);
    alignToSign(o1LetSprite, showdownOffSprite, -0.48, 0.095, 1);

    w1LetSprite.anchor.set(0.5);
    alignToSign(w1LetSprite, showdownOffSprite, -0.155, 0.058, 1);

    dLetSprite.anchor.set(0.5);
    alignToSign(dLetSprite, showdownOffSprite, 0.18, 0.035, 1);

    o2LetSprite.anchor.set(0.5);
    alignToSign(o2LetSprite, showdownOffSprite, 0.43, 0.048, 1);

    w2LetSprite.anchor.set(0.5);
    alignToSign(w2LetSprite, showdownOffSprite, 0.68, 0.094, 1);

    nLetSprite.anchor.set(0.5);
    alignToSign(nLetSprite, showdownOffSprite, 1.01, 0.1, 1);


    mustDropSprite.anchor.set(0.5);
    alignToSign(mustDropSprite, showdownOffSprite, -0.02, 0.375, 0.62);


    spinnerBox.width = innerWidth;
    spinnerBox.height = innerHeight*0.6;
    spinnerBox.pivot.x = (innerWidth/2);
    spinnerBox.pivot.y = (innerHeight*0.6)/2;
    moveSpinnerToBottom(spinnerBox);

    wheelSprite.anchor.set(0.5);
    keepWheelSquare(wheelSprite);
    wheelSprite.position.set(0,(wheelSprite.width*0.125));
    addWheelShadow(wheelSprite, wheelShadow);
    wheelSprite.rotation = 0;

    let wheelWidth = wheelSprite.width;
    let markerOffsetX = wheelWidth/2.8;
    let markerOffsetY = (wheelWidth/-2.8)+(wheelSprite.width*0.1);
    markerSprite.anchor.set(0.5);
    markerSprite.position.set(markerOffsetX, markerOffsetY);
    markerSprite.height = wheelWidth*0.3;
    markerSprite.width = markerSprite.height*0.455;
    markerSprite.rotation = 0.75;

    let buttonOffset = wheelWidth/-2;
    buttonSprite.anchor.set(0.5);
    buttonSprite.position.set(0,buttonOffset);
    buttonSprite.width = wheelWidth*0.9;
    buttonSprite.height = buttonSprite.width*0.222;

    // Responsiveness
    if (innerWidth >= 1200 && innerHeight >= 900 && innerWidth > innerHeight) {
        wheelSprite.position.set((-0.25*innerHeight),(wheelSprite.width*0.05));
        markerSprite.position.set((wheelWidth/2.8)-(wheelSprite.width*0.5), (wheelWidth/-3));
        buttonSprite.position.set((0.33*innerHeight),0);
        addWheelShadow(wheelSprite, wheelShadow);
    }

    if (innerWidth >= 1600 && innerHeight >= 900 && innerWidth > innerHeight) {
        keepWheelSquare(wheelSprite, wheelShadow);
        let xPos = -1.2*wheelSprite.width*0.5;
        let yPos = innerHeight*0;
        wheelSprite.position.set(xPos,yPos);
        markerSprite.position.set(markerOffsetX-(wheelSprite.width*0.6), markerOffsetY-(wheelSprite.width*0.125));
        buttonSprite.position.set((0.33*innerHeight),0);
        addWheelShadow(wheelSprite, wheelShadow);
    }

    if (innerWidth > (innerHeight*1.75)) {
        keepWheelSquare(wheelSprite, wheelShadow);
        let xPos = -1.2*wheelSprite.width*0.5;
        let yPos = 0;
        wheelSprite.position.set(xPos,yPos);
        markerSprite.position.set(markerOffsetX+(xPos), markerOffsetY-(wheelSprite.width*0.12));
        buttonSprite.position.set((0.33*innerHeight),0);
        addWheelShadow(wheelSprite, wheelShadow);
    }

    if (innerHeight >= (innerWidth*1.75) && innerWidth < 500 && innerHeight >= (innerWidth*2)) {
        buttonOffset = wheelWidth/-1.65;
        buttonSprite.position.set(0,buttonOffset);
    } else if (innerHeight > (innerWidth*1.75) && innerWidth < 500 && innerHeight < (innerWidth*2)) {
        buttonOffset = wheelWidth/-2;
        buttonSprite.position.set(0,buttonOffset);
    }

    addButtonShadow(buttonSprite, buttonShadow);
    addInteractions(buttonSprite, wheelSprite);

    // attach
    spinnerBox.addChild(wheelShadow);
    spinnerBox.addChild(buttonShadow);
    spinnerBox.addChild(wheelSprite);
    spinnerBox.addChild(markerSprite);
    spinnerBox.addChild(buttonSprite);

    headerAnimationBox.addChild(showdownOffSprite);

    headerAnimationBox.addChild(slotsSprite);
    headerAnimationBox.addChild(vegasSprite);
    headerAnimationBox.addChild(boltOnSprite);

    headerAnimationBox.addChild(sLetSprite);
    headerAnimationBox.addChild(hLetSprite);
    headerAnimationBox.addChild(o1LetSprite);
    headerAnimationBox.addChild(w1LetSprite);

    headerAnimationBox.addChild(dLetSprite);
    headerAnimationBox.addChild(o2LetSprite);
    headerAnimationBox.addChild(w2LetSprite);
    headerAnimationBox.addChild(nLetSprite);

    headerAnimationBox.addChild(mustDropSprite);

    headerBox.addChild(headerSprite);
    headerBox.addChild(headerAnimationBox);
    
    if (!first) {
        stage.removeChildren();
    } else {
        turnOffLights();
        addAnimations();
    }

    stage.addChild(headerBox);
    stage.addChild(spinnerBox);
    first = false;
}

function turnOffLights() {
    // hideThis(boltOffSprite);
    hideThis(boltOnSprite);
    hideThis(vegasSprite);
    hideThis(slotsSprite);

    hideThis(sLetSprite);
    hideThis(hLetSprite);
    hideThis(o1LetSprite);
    hideThis(w1LetSprite);
    hideThis(dLetSprite);
    hideThis(o2LetSprite);
    hideThis(w2LetSprite);
    hideThis(nLetSprite);

    hideThis(mustDropSprite);
}

function addAnimations() {
    let vegasScene = true;
    let vegasCount = 0;
    let vegasSpeed = 0.25;
    let vegasSlotsAlpha = slotsSprite.alpha;
    let vegasLit = false;

    let boltScene = false;
    let boltCount = 0;
    let boltSpeed = 0.175;
    let boltAlpha = boltOnSprite.alpha;
    let boltLit = false;
    let boltBeat = false;
    let boltLoop = 0;
    let boltHook = false;

    let showScene = false;
    let showSpeed = 0.75;
    let showStart = 1500;
    let showDrag = 150;
    let showLit = false;
    let sOn = false;
    let hOn = false;
    let o1On = false;
    let w1On = false;
    let dOn = false;
    let o2On = false;
    let w2On = false;
    let nOn = false;
    let sAlpha = sLetSprite.alpha;
    let hAlpha = hLetSprite.alpha;
    let o1Alpha = o1LetSprite.alpha;
    let w1Alpha = w1LetSprite.alpha;
    let dAlpha = dLetSprite.alpha;
    let o2Alpha = o2LetSprite.alpha;
    let w2Alpha = w2LetSprite.alpha;
    let nAlpha = nLetSprite.alpha;

    let dropScene = false;
    let dropCount = 0;
    let dropSpeed = 0.2;
    let dropAlpha = mustDropSprite.alpha;
    let dropLit = false; 

    app.ticker.add((delta) => {
        sceneTimer = (sceneTimer + app.ticker.elapsedMS);
        if (sceneTimer > showStart) {
            showScene = true;
        }

        if (goTime && vegasScene) {
            if (vegasLit === false) {
                vegasSprite.alpha += vegasSpeed * delta;
                slotsSprite.alpha += vegasSpeed * delta;
                vegasSlotsAlpha = slotsSprite.alpha;
                
                if (vegasSlotsAlpha >= 1 && sceneTimer > 1450) {
                    vegasLit = true;
                }
            }

            if (vegasLit === true) {
                vegasSprite.alpha -= vegasSpeed * delta;
                slotsSprite.alpha -= vegasSpeed * delta;
                vegasSlotsAlpha = slotsSprite.alpha;
            }

            if (vegasLit === true && vegasSlotsAlpha <= 0) {
                vegasLit = false;
                if (vegasCount == 1) {
                    vegasSpeed = (vegasSpeed * 2);
                }
                vegasCount = (vegasCount + 1);
            }

            if (vegasCount == 2) {
                vegasSprite.alpha = 1;
                slotsSprite.alpha = 1;
                vegasScene = false;
                boltScene = true;
            }
        }

        if (goTime && boltScene) {
            if (boltLit === false) {
                boltOnSprite.alpha += boltSpeed * delta;
                boltAlpha = boltOnSprite.alpha;
                
                if (boltAlpha >= 1 && sceneTimer > 1000) {
                    boltLit = true;
                }
            }

            if (boltLit === true) {
                boltOnSprite.alpha -= boltSpeed * delta;
                boltAlpha = boltOnSprite.alpha;
            }

            if (boltLit === true && boltAlpha <= 0) {
                boltLit = false;
                boltCount = (boltCount + 1);
            }

            if (boltCount == 16) {
                boltOnSprite.alpha = 1;
                boltScene = false;
                boltBeat = true;
            }
        }

        if (boltBeat && sceneTimer > 5000) {
            if (boltLit === false) {
                boltOnSprite.alpha += boltSpeed * delta;
                boltAlpha = boltOnSprite.alpha;
                
                if (boltAlpha >= 1 && sceneTimer > 15000) {
                    if (!boltHook) {
                        boltLoop = sceneTimer;
                        boltCount = 0;
                        boltSpeed = 0.25;
                        boltHook = true;
                    }
                    boltLit = true;
                }
            }

            if (boltLit === true) {
                boltOnSprite.alpha -= boltSpeed * delta;
                boltAlpha = boltOnSprite.alpha;
            }

            if (boltLit === true && boltAlpha <= 0) {
                boltLit = false;
                boltCount = (boltCount + 1);
            }

            if (boltCount > 12) {
                boltOnSprite.alpha = 1;
                boltBeat = false;
                boltCount = 0;
                boltLoop = sceneTimer;
            }
        }

        if ((sceneTimer-boltLoop) > 10000) {
            boltBeat = true;
        }

        if (goTime && showScene) {
            if (showLit === false) {
                if (sOn === false) {
                    sLetSprite.alpha += showSpeed * delta;
                    sAlpha = sLetSprite.alpha;
                }

                if (sAlpha >= 1) {
                    sOn = true;
                    sLetSprite.alpha = 1;
                }

                if (hOn === false && (sceneTimer > (showStart + showDrag))) {
                    hLetSprite.alpha += showSpeed * delta;
                    hAlpha = hLetSprite.alpha;
                }

                if (hAlpha >= 1) {
                    hOn = true;
                    hLetSprite.alpha = 1;
                }

                if (o1On === false && (sceneTimer > (showStart + (2*showDrag)))) {
                    o1LetSprite.alpha += showSpeed * delta;
                    o1Alpha = o1LetSprite.alpha;
                }

                if (o1Alpha >= 1) {
                    o1On = true;
                    o1LetSprite.alpha = 1;
                }

                if (w1On === false && (sceneTimer > (showStart + (3*showDrag)))) {
                    w1LetSprite.alpha += showSpeed * delta;
                    w1Alpha = w1LetSprite.alpha;
                }

                if (w1Alpha >= 1) {
                    w1On = true;
                    w1LetSprite.alpha = 1;
                }

                if (dOn === false && (sceneTimer > (showStart + (4*showDrag)))) {
                    dLetSprite.alpha += showSpeed * delta;
                    dAlpha = dLetSprite.alpha;
                }

                if (dAlpha >= 1) {
                    dOn = true;
                    dLetSprite.alpha = 1;
                }

                if (o2On === false && (sceneTimer > (showStart + (5*showDrag)))) {
                    o2LetSprite.alpha += showSpeed * delta;
                    o2Alpha = o2LetSprite.alpha;
                }

                if (o2Alpha >= 1) {
                    o2On = true;
                    o2LetSprite.alpha = 1;
                }

                if (w2On === false && (sceneTimer > (showStart + (6*showDrag)))) {
                    w2LetSprite.alpha += showSpeed * delta;
                    w2Alpha = w2LetSprite.alpha;
                }

                if (w2Alpha >= 1) {
                    w2On = true;
                    w2LetSprite.alpha = 1;
                }

                if (nOn === false && (sceneTimer > (showStart + (7*showDrag)))) {
                    nLetSprite.alpha += showSpeed * delta;
                    nAlpha = nLetSprite.alpha;
                }

                if (nAlpha >= 1) {
                    nOn = true;
                    nLetSprite.alpha = 1;
                    showLit = true;
                    dropScene = true;
                }
            }

            if (showLit && (sceneTimer > 8000)) {
                goTime = false;
            }
        }

        if (goTime && dropScene && (sceneTimer > 2750)) {
            if (dropLit === false) {
                mustDropSprite.alpha += dropSpeed * delta;
                dropAlpha = mustDropSprite.alpha;
                
                if (dropAlpha >= 1 && sceneTimer > 2950) {
                    dropLit = true;
                }
            }

            if (dropLit === true) {
                mustDropSprite.alpha -= dropSpeed * delta;
                dropAlpha = mustDropSprite.alpha;
            }

            if (dropLit === true && dropAlpha <= 0) {
                dropLit = false;
                if (dropCount == 1) {
                    dropSpeed = (dropSpeed * 2);
                }
                dropCount = (dropCount + 1);
            }

            if (dropCount == 2) {
                mustDropSprite.alpha = 1;
                dropScene = false;
            }
        }
    

        if (spinning) {
            data = (parseInt(wheelSprite.rotation, 10));
            if ((targetPos == 1) && (data >= (12))) {
                spinning = false;
                passed = false;
                stopping = true;
            } else if ((targetPos == 2) && (data >= (14))) {
                spinning = false;
                passed = false;
                stopping = true;
            } else if ((targetPos == 3) && (data >= (15))) {
                spinning = false;
                passed = false;
                stopping = true;
            } else if ((targetPos == 4) && (data >= (19))) {
                spinning = false;
                passed = false;
                stopping = true;
            } else {
                wheelSprite.rotation += 0.1 * delta;
            }
        }

        if (stopping) {
            data = parseInt(wheelSprite.rotation, 10);
            if ((targetPos == 1) && data >= (31)) {
                stopping = false;
                done = true;
            } else if ((targetPos == 2) && data >= (27)) {
                stopping = false;
                done = true;
            } else if ((targetPos == 3) && data >= (22)) {
                stopping = false;
                done = true;
            } else if ((targetPos == 4) && data >= (23)) {
                stopping = false;
                done = true;
            } else {
                wheelSprite.rotation += 0.05 * delta;
            }
        }

        if (done) {
            if (!wheelHook) {
                base = (base * rando) - (base * salt);
                base = wheelSprite.rotation + (rando*salt);
                wheelHook = true;
            }
            
            if (wheelSprite.rotation < base) {
                wheelSprite.rotation += 0.002 * delta * salt;
                console.log(rando + " " + base);
            } else {
                wheelSprite.rotation = wheelSprite.rotation;
                processed = false;
                spinRequested = false;
                wheelHook = false;
                done = false;
            }
        }
    });
}

function hideThis(obj) {
    obj.alpha = 0;
}

function addInteractions(buttonObj, wheelObj) {
    buttonObj.interactive = true;
    buttonObj.buttonMode = true;
    buttonObj.on(touchType, () => {
        if (!spinRequested) {
            resetWheel();
            spinRequested = true;
            spinning = true;
            positionData = setData();
        } else {
            return;
        }
    });
}

function resetWheel() {
    wheelSprite.rotation = (0 + salt) * rando;
}

/* Get JSON Data */
function setData() {
    function requestData() {
        const url = "./src/data.json";
        let req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open('GET', url, true);
        req.onload = function() {
            let jsonResponse = JSON.parse(req.responseText);
            positionData = jsonResponse.POSITION;
            positionData = parseInt(positionData, 10);
            handleData(positionData);
        };
        req.send(null);
    }

    function handleData(position) {
        switch (position) {
            case 1:
                targetPos = 1; // goalAngle = 47;
                break;
            case 2:
                targetPos = 2; // goalAngle = 137;
                break;
            case 3:
                targetPos = 3; // goalAngle = 227;
                break;
            case 4:
                targetPos = 4; // goalAngle = 317;
                break;
            default:
        }
    }

    requestData();
    targetPos = 1;
    processed = true;
}

function fillWindow() {
    innerWidth = window.innerWidth;
    innerHeight = window.innerHeight;
    canvasDOM.style.width = innerWidth;
    canvasDOM.style.height = innerHeight;
    app.view.style.width = innerWidth;
    app.view.style.height = innerHeight;
    app.view.width = innerWidth;
    app.view.height = innerHeight;
    app.renderer.resize(innerWidth, innerHeight);
}

function consolidatedScaler () {
    fillWindow();
    spriteSetup();
}

function centerAtMiddle(obj) {
    let centerWidth = (innerWidth)/2;
    let centerHeight = (innerHeight)/2;
    obj.position.set(centerWidth,centerHeight);
}

function moveHeaderToTop(obj) {
    let centerWidth = (innerWidth)/2;
    let vertOffset = (innerHeight*0.4)/4;
    let vertPos = 0-vertOffset;
    obj.position.set(centerWidth, vertPos);
}

function moveSpinnerToBottom(obj) {
    let centerWidth = innerWidth;
    let vertPos = innerHeight*0.975;
    obj.position.set(centerWidth, vertPos);
}

function keepWheelSquare(obj) {
    let scaler = 0.5;
    if (innerWidth < (innerHeight*scaler)) {
        obj.width = innerWidth*0.9;
        obj.height = innerWidth*0.9;
    } else if (innerWidth > (innerHeight*scaler)) {
        obj.width = innerHeight*scaler;
        obj.height = innerHeight*scaler;
    }

    if (innerWidth > 1600) {
        obj.width = 1.25*innerHeight*scaler;
        obj.height = 1.25*innerHeight*scaler;
    }
}

function addWheelShadow(wheel,shadow) {
    let wheelWidth = wheel.width;
    let wheelHeight = wheel.height;
    let wheelX = wheel.position.x;
    let wheelY = wheel.position.y;
    let offsetX = innerHeight * 0.005;
    let offsetY = innerHeight * 0.015;

    shadow.width = wheelWidth * 1.1;
    shadow.height = wheelHeight * 1.1;
    shadow.anchor.set(0.5);
    shadow.position.x = wheelX + offsetX;
    shadow.position.y = wheelY + offsetY;
}

function addButtonShadow(button,shadow) {
    let buttonWidth = button.width;
    let buttonHeight = button.height;
    let buttonX = button.position.x;
    let buttonY = button.position.y;
    let offsetX = innerHeight * 0.005;
    let offsetY = innerHeight * 0.015;

    shadow.anchor.set(0.5);
    shadow.width = buttonWidth * 1;
    shadow.height = buttonHeight * 1.2;
    shadow.position.x = buttonX + offsetX;
    shadow.position.y = buttonY + offsetY;
}

function keepLightsScaled(obj) {
    let scaler = 0.42;
    if (innerWidth < (innerHeight*0.75)) {
        obj.width = innerWidth*0.9;
        obj.height = (obj.width)*scaler;
    } else if ((innerWidth < innerHeight) && (innerWidth > 620)) {
        obj.width = innerWidth*0.75;
        obj.height = (obj.width)*scaler;
    } else if (innerWidth < (innerHeight*1.5)) {
        obj.width = innerWidth*0.5;
        obj.height = (obj.width)*scaler;
    } else if (innerWidth > (innerHeight*2)) {
        obj.width = innerHeight*0.75;
        obj.height = (obj.width)*scaler;
    } else {
        obj.width = innerWidth*0.4;
        obj.height = (obj.width)*scaler;
    }

    obj.position.set(0,0);
}

function alignToSign(obj, sign, xFactor, yFactor, baseFactor) {
    let baseScaler = baseFactor;
    let baseScaleX = sign.scale.x*baseScaler;
    let baseScaleY = sign.scale.y*baseScaler;

    obj.scale.set(baseScaleX, baseScaleY);

    let xOffset = sign.height * xFactor;
    let yOffset = sign.height * yFactor;
        
    obj.position.set(xOffset, yOffset);
}

function loadProgressHandler(loader, resource) {
    return;
}

function itIsGoTime() {
    app.start();
    setTimeout(function () {
        goTime = true;
        this.clearTimeout();
    }, 1000);
}

window.addEventListener('DOMContentLoaded', consolidatedScaler);
window.addEventListener('resize', consolidatedScaler);
window.addEventListener('DOMContentLoaded', itIsGoTime);
