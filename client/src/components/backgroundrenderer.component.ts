import {
    Assets,
    Application,
    Sprite,
    Container,
    Texture,
    // ParticleContainer,
    Text,
    TextStyle,
    Graphics} from "pixi.js"

import {
    Engine,
    Body,
    Bodies,
    Composite,
    Vector,
    Constraint
} from 'matter-js'

interface Circle {
    sprite: Sprite,
    object: Matter.Body
    tail: Graphics | null
}

export let app: Application | null = null
let engine: Engine | null = null

let clearBackgroundRendering = false
let objectList: Circle[] = []

let particleContainer: Container | null = null
let text: Text | null = null
let background: Graphics | null = null

const spriteCount = 50
const SCALE = 5
const LINELENGTH = 250

function animationTicker(objects: Circle[]) {
    if (!engine) {
        return
    }

    if (text) {
        text.zIndex = 1000
        text.style.stroke = 'white'
        text.style.strokeThickness = 2
        text.text = `FPS: ${Math.max(60, Math.round(app?.ticker.FPS ?? 0))} \nelapsedMS: ${Math.round(app?.ticker.elapsedMS ?? 0)} \ndelta: ${Math.round(app?.ticker.deltaTime ?? 0)}`
    }

    console.assert(spriteCount === objectList.length, 'Object count does not match sprite list length')

    const delta = app?.ticker.deltaTime ?? 1

    Engine.update(engine, 1000 / 60, delta)

    const edgeMultiplier = 1/15
    let previousObject: Circle | null = null
    const centerPosition = Vector.create(window.innerWidth / 2, window.innerHeight / 2)
    for (const object of objects) {
        if (object.object.position.x > window.innerWidth
            || (object.object.position.x < -object.sprite.width)
            || (object.object.position.y > window.innerHeight)
            || (object.object.position.y < -object.sprite.height)) {
            Body.applyForce(object.object, object.object.position, Vector.mult(Vector.normalise(Vector.sub(centerPosition, object.object.position)), edgeMultiplier))
        }

        object.sprite.x = object.object.position.x
        object.sprite.y = object.object.position.y

        const tail = object.tail

        if (tail && previousObject) {
            tail.clear()

            const distanceBetweenPoints = Math.sqrt(Math.pow(previousObject.object.position.x - object.object.position.x, 2) + Math.pow(previousObject.object.position.y - object.object.position.y, 2))

            const redComponent =  Math.round(255 * Math.max(0, Math.min(1, (distanceBetweenPoints - LINELENGTH) / (LINELENGTH))))
            const greenComponent = 255 - redComponent
            tail.lineStyle({
                width: 3,
                color: `rgb(${redComponent}, ${greenComponent}, 0)`
            })
            tail.zIndex = -100
            const difference = Vector.sub(previousObject.object.position, object.object.position)
            const circleEdgePosition0 = Vector.sub(previousObject.object.position, Vector.mult(Vector.normalise(difference), previousObject.sprite.width / 2))
            const circleEdgePosition = Vector.add(object.object.position, Vector.mult(Vector.normalise(difference), object.sprite.width / 2))
            tail.moveTo(circleEdgePosition0.x, circleEdgePosition0.y)
            tail.lineTo(circleEdgePosition.x, circleEdgePosition.y)

            tail.lineStyle({
                width: 3,
                color: `rgb(0, 0, 0)`
            })


            const scaledDifference = Vector.mult(Vector.normalise(difference), 20)


            const arrowLeft = Vector.rotate(scaledDifference, Math.PI / 4)
            const arrowRight = Vector.rotate(scaledDifference, -Math.PI / 4)

            tail.moveTo(arrowLeft.x + circleEdgePosition.x, arrowLeft.y + circleEdgePosition.y)
            tail.lineTo(circleEdgePosition.x, circleEdgePosition.y)
            tail.lineTo(arrowRight.x + circleEdgePosition.x, arrowRight.y + circleEdgePosition.y)

            tail.zIndex = 100
        }

        previousObject = object
    }
}


function cleanPixi(objects: Circle[]) {
    if (app === null) {
        return
    }

    app.stage.removeChildren()
    app.destroy()
    app = null

    for (const object of objects) {
        object.sprite.destroy()

        if (object.tail) {
            object.tail.destroy()
        }
    }

    Assets.reset()

    console.log('Destroying PIXI!')

    objectList = []

    background?.destroy()
    background = null
    particleContainer?.destroy()
    particleContainer = null

    engine = null

    clearBackgroundRendering = true

    text?.destroy()
    text = null
}


export async function loadBackgroundRendering(id: string) {
    if (app) {
        cleanPixi(objectList)
    }

    engine = Engine.create()

    engine.gravity.scale = 0

    console.log('Setting up PIXI')

    app = new Application<HTMLCanvasElement>({
        width: window.innerWidth,
        height: window.innerHeight,
        resizeTo: window,
        antialias: true,
        backgroundColor: 0xFFFFFF,
        sharedTicker: true
    })

    window.onresize = () => {
        app?.renderer.resize(window.innerWidth, window.innerHeight)
        background?.clear()
        background?.beginFill(0xFFFFFF)
        background?.drawRect(0, 0, window.innerWidth, window.innerHeight)
        background?.endFill()
    }

    const testElement = document.getElementById(id)

    if (testElement === null) {
        return
    }

    app.stage.filters = []

    const texture = await Assets.load<Texture>({alias: 'image', src: 'https://dev.citadel:3001/images/circle2.png'})
    objectList = []
    particleContainer = new Container(
    )

    console.log(app.stage.eventMode)
    console.log(app.stage.interactive)

    background = new Graphics()
    background.beginFill(0xFFFFFF)
    background.drawRect(0, 0, innerWidth, innerHeight)
    background.endFill()
    background.zIndex = -1000
    app.stage.addChild(background)

    background.eventMode = 'static'

    background.on('pointerdown', (event) => {
        const mouseOrigin = Vector.create(event.clientX, event.clientY)
        for (const object of objectList) {
            Body.applyForce(object.object, object.object.position, Vector.div(Vector.normalise(Vector.sub(object.object.position, mouseOrigin)), 1))
        }
    })

    particleContainer.zIndex = -20
    app.stage.addChild(particleContainer)
    app.stage.sortableChildren = true

    let previousBody: Body | null = null

    for (let i = 0; i < spriteCount; i++) {
        const scale = Math.random() * 20
        const object = Bodies.circle(Math.random() * window.innerWidth, Math.random() * window.innerHeight, SCALE + scale)
        const sprite = Sprite.from(texture)

        Body.setMass(object, 10)

        let newTail = null

        if (previousBody && Math.random() > 0.5) {
            Composite.add(engine.world, Constraint.create({
                bodyA: previousBody,
                bodyB: object,
                length: LINELENGTH,
                stiffness: 0.01
            }))

            newTail = new Graphics()

            newTail.lineStyle({
                width: 20,
                color: 'red'
            })

            newTail.moveTo(previousBody.position.x, previousBody.position.y)
            newTail.lineTo(object.position.x, object.position.y)

            const difference = Vector.sub(object.position, previousBody.position)
            const arrowLeft = Vector.rotate(difference, Math.PI / 2)
            const arrowRight = Vector.rotate(difference, -Math.PI / 2)

            newTail.moveTo(arrowLeft.x, arrowLeft.y)
            newTail.lineTo(object.position.x, object.position.y)
            newTail.lineTo(arrowRight.x, arrowRight.y)
            newTail.endFill()

            newTail.zIndex = -100


            app.stage.addChild(newTail)
        }

        previousBody = object

        Composite.add(engine.world, object)

        sprite.width = (SCALE + scale) * 2
        sprite.height = (SCALE + scale) * 2
        sprite.x = object.position.x
        sprite.y = object.position.y
        sprite.anchor.set(0.5)

        sprite.tint = Math.random() * 0xFFFFFF
        sprite.eventMode = 'static'
        sprite.onpointertap = () => {
            // Set static
            Body.setStatic(object, false)
        }

        particleContainer.addChild(sprite)

        Body.setStatic(object, true)

        objectList.push({
            sprite: sprite,
            object: object,
            tail: newTail
        })

    }

    const style = new TextStyle({
        fontFamily: "\"Lucida Console\", Monaco, monospace",
        stroke: 'black',
        fontSize: 30,
        fill: 'black'
    })

    text = new Text('Hello World', style)

    text.x = 30
    text.y = 30

    app.stage.addChild(text)
    app.ticker.add(() => {
        animationTicker(objectList)
    })


    if (!clearBackgroundRendering) {
        window.addEventListener('beforeunload', () => {cleanPixi(objectList)})
    }

    // Clear children of test div
    testElement.innerHTML = ''

    testElement.appendChild(app.view as HTMLCanvasElement)
}