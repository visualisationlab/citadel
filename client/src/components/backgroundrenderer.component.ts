import {
    Assets,
    Application,
    Sprite,
    Container,
    Texture,
    ParticleContainer,
    Text,
    TextStyle,
    Graphics,
    FederatedEvent,
    FederatedMouseEvent} from "pixi.js"

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

const spriteCount = 1000
const SCALE = 5
const LINELENGTH = 200

function animationTicker(objects: Circle[]) {
    if (!engine) {
        return
    }

    if (text) {
        text.text = `FPS: ${Math.round(app?.ticker.FPS ?? 0)}`
    }

    console.assert(spriteCount === objectList.length, 'Object count does not match sprite list length')

    const delta = app?.ticker.deltaTime ?? 0

    Engine.update(engine, 1000 / 60, delta)
    // Update visuals

    const firstObject = objects[0]

    // if (firstObject) {
    //     Body.setSpeed(firstObject.object, 10)
    // }

    let previousObject: Circle | null = null

    for (const object of objects) {
        if (object.object.position.x > window.innerWidth) {
            Body.setPosition(object.object, Vector.create(0, object.object.position.y))
        }
        else if (object.object.position.x < -object.sprite.width) {

            Body.setPosition(object.object, Vector.create(window.innerWidth, object.object.position.y))
        }

        if (object.object.position.y > window.innerHeight) {
            Body.setPosition(object.object, Vector.create(object.object.position.x, 0))
        }
        else if (object.object.position.y < -object.sprite.height) {
            Body.setPosition(object.object, Vector.create(object.object.position.x, window.innerHeight))
        }

        object.sprite.x = object.object.position.x
        object.sprite.y = object.object.position.y

        const tail = object.tail

        if (tail && previousObject) {
            tail.clear()

            const distanceBetweenPoints = Math.sqrt(Math.pow(previousObject.object.position.x - object.object.position.x, 2) + Math.pow(previousObject.object.position.y - object.object.position.y, 2))

            tail.lineStyle({
                width: 3,
                color: distanceBetweenPoints > LINELENGTH ? 'red' : 'green'
            })
            tail.zIndex = -100
            tail.moveTo(previousObject.object.position.x, previousObject.object.position.y)
            tail.lineTo(object.object.position.x, object.object.position.y)
        }

        previousObject = object
    }
}


function cleanPixi(spriteList: Circle[]) {
    if (app === null) {
        return
    }

    console.log('Clearing PIXI!')

    console.log('Destroying Children!')

    app.stage.removeChildren()
    app.destroy()

    for (let i = 0; i < spriteCount; i++) {
        const object = spriteList[i]
        if (object === undefined) {
            continue
        }

        object.sprite.destroy()
    }

    Assets.reset()

    console.log('Destroying PIXI!')

    spriteList = []
    app = null
    particleContainer = null

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
        // antialias: true,
        backgroundColor: 0xFFFFFF,
    })

    const testElement = document.getElementById(id)

    if (testElement === null) {
        return
    }

    app.stage.filters = []

    const texture = await Assets.load<Texture>({alias: 'image', src: 'https://dev.citadel:3001/VisLablogo-cropped-notitle.svg'})
    objectList = []
    particleContainer = new Container(
    )

    console.log(app.stage.eventMode)
    console.log(app.stage.interactive)

    const background = new Graphics()
    background.beginFill(0xFFFFFF)
    background.drawRect(0, 0, innerWidth, innerHeight)
    background.endFill()
    background.zIndex = -1000
    app.stage.addChild(background)

    background.eventMode = 'static'

    background.on('pointerdown', (event) => {
        const mouseOrigin = Vector.create(event.clientX, event.clientY)
        for (const object of objectList) {
            Body.applyForce(object.object, object.object.position, Vector.div(Vector.normalise(Vector.sub(object.object.position, mouseOrigin)), 10))
        }
    })
    // app.stage.on('mousemovecapture') = (event: FederatedMouseEvent) => {
    //     console.log(event.clientX)
    //     console.log('hierzo 2')
    // }

    particleContainer.zIndex = -20
    app.stage.addChild(particleContainer)
    app.stage.sortableChildren = true

    let previousBody: Body | null = null

    for (let i = 0; i < spriteCount; i++) {
        const scale = Math.random() * 20
        const object = Bodies.circle(Math.random() * window.innerWidth, Math.random() * window.innerHeight, SCALE + scale)
        const sprite = Sprite.from(texture)

        // Body.setMass(object, Math.random())

        let newTail = null

        if (previousBody) {
            Composite.add(engine.world, Constraint.create({
                bodyA: previousBody,
                bodyB: object,
                length: LINELENGTH,
                stiffness: 0.001
            }))

            newTail = new Graphics()

            newTail.lineStyle({
                width: 20,
                color: 'red'
            })

            newTail.moveTo(previousBody.position.x, previousBody.position.y)
            newTail.lineTo(object.position.x, object.position.y)

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

        particleContainer.addChild(sprite)

        objectList.push({
            sprite: sprite,
            object: object,
            tail: newTail
        })

    }

    const style = new TextStyle({
        fontFamily: "\"Lucida Console\", Monaco, monospace"
    })

    text = new Text('Hello World', style)

    text.x = 10
    text.y = 10
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