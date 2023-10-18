import {
    Assets,
    Application,
    Sprite,
    Container,
    Texture,
    ParticleContainer,
    Text,
    TextStyle} from "pixi.js"

export let app: Application | null = null

let clearBackgroundRendering = false
let spriteList: RenderedSprite[] = []
let particleContainer: Container | null = null
let text: Text | null = null

const spriteCount = 50
const SPRITE_VELOCITY = 2
const SCALE = 50

interface RenderedSprite {
    sprite: Sprite,
    vx: number,
    vy: number
}

function animationTicker(spriteList: RenderedSprite[]) {
    if (text) {
        text.text = `FPS: ${Math.round(app?.ticker.FPS ?? 0)}`
    }
    console.assert(spriteCount === spriteList.length, 'Sprite count does not match sprite list length')
    const delta = app?.ticker.deltaTime ?? 0
    for (let i = 0; i < spriteCount; i++) {
        const object = spriteList[i]

        if (object === undefined) {
            continue
        }

        const sprite = object.sprite

        if (sprite.x > window.innerWidth) {
            sprite.x = -sprite.width
        }

        if (sprite.x < -sprite.width) {
            sprite.x = window.innerWidth
        }

        if (sprite.y > window.innerHeight) {
            sprite.y = -sprite.height
        }

        if (sprite.y < -sprite.height) {
            sprite.y = window.innerHeight
        }

        // If object is close to another object, move away from it
        // for (let j = 0; j < spriteCount; j++) {
        //     if (i === j) {
        //         continue
        //     }

        //     const otherObject = spriteList[j]

        //     if (otherObject === undefined) {
        //         continue
        //     }

        //     const otherSprite = otherObject.sprite

        //     const dx = sprite.x - otherSprite.x
        //     const dy = sprite.y - otherSprite.y

        //     const distance = Math.sqrt(dx * dx + dy * dy)

        //     if (distance < 15) {
        //         object.vx = Math.min(Math.abs(object.vx + dx / distance), SPRITE_VELOCITY)
        //         object.vy = Math.min(Math.abs(object.vy + dy / distance), SPRITE_VELOCITY)

        //         sprite.width = 10
        //         sprite.height = 10
        //     }
        // }

        sprite.x += object.vx + Math.sign(object.vx) * delta
        sprite.y += object.vy + Math.sign(object.vy) * delta
        // sprite.rotation += 0.1

        // const VELOCITY_SLOWDOWN = 0.01

        // // Return to original size over time
        // if (Math.abs(sprite.width - 20) > 0.1) {
        //     sprite.width += 0.2
        //     sprite.height += 0.2
        // }

        // // Return to original velocity over time
        // if (Math.abs(object.vx) > 0) {
        //     object.vx -= Math.sign(object.vx) * VELOCITY_SLOWDOWN - Math.sign(object.vx) * delta

        //     if (Math.abs(object.vx) < 0.3) {
        //         object.vx = 0
        //     }
        // } else {
        //     if (Math.abs(sprite.x - window.innerWidth / 2) < 20) {
        //         object.vx = 0

        //         continue
        //     }

        //     if (sprite.x > window.innerWidth / 2) {
        //         object.vx -= SPRITE_VELOCITY / 10
        //     } else {
        //         object.vx += SPRITE_VELOCITY / 10
        //     }
        // }

        // if (Math.abs(object.vy) > 0) {
        //     object.vy -= Math.sign(object.vy) * VELOCITY_SLOWDOWN - Math.sign(object.vy) * delta

        //     if (Math.abs(object.vy) < 0.3) {
        //         object.vy = 0
        //     }
        // }
        // else {
        //     if (Math.abs(sprite.y - window.innerHeight / 2) < 20) {
        //         object.vy = 0

        //         continue
        //     }

        //     if (sprite.y > window.innerHeight / 2) {
        //         object.vy -= SPRITE_VELOCITY / 10
        //     } else {
        //         object.vy += SPRITE_VELOCITY / 10
        //     }
        // }
    }
}


function cleanPixi(spriteList: RenderedSprite[]) {
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
        cleanPixi(spriteList)
    }

    console.log('Setting up PIXI!!!!')

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

    // Clear children of test div
    testElement.innerHTML = ''

    testElement.appendChild(app.view as HTMLCanvasElement)

    app.stage.filters = []

    const texture = await Assets.load<Texture>({alias: 'image', src: 'https://dev.citadel:3001/VisLablogo-cropped-notitle.svg'})

    spriteList = []
    particleContainer = new ParticleContainer(
        spriteCount,
        {
            scale: true,
            position: true,
            rotation: true,
            uvs: true,
            alpha: false,
        }
    )

    // particleContainer.eventMode = 'static'

    app.stage.addChild(particleContainer)

    for (let i = 0; i < spriteCount; i++) {
        const sprite = Sprite.from(texture)
        spriteList.push({
            sprite: sprite,
            vx: (Math.random() - 0.5) * SPRITE_VELOCITY,
            vy: (Math.random() - 0.5) * SPRITE_VELOCITY
        })

        const scale = Math.random() * 20
        sprite.width = SCALE + scale
        sprite.height = SCALE + scale
        sprite.anchor.set(0.5)
        sprite.rotation = Math.random() * Math.PI * 2
        sprite.x = Math.random() * window.innerWidth
        sprite.y = Math.random() * window.innerHeight

        sprite.eventMode = 'static'

        sprite.onpointerdown = () => {
            sprite.tint = 0xFF0000
            sprite.width = 20
        }

        sprite.tint = Math.random() * 0xFFFFFF

        particleContainer.addChild(sprite)
    }

    const style = new TextStyle({
        fontFamily: "\"Lucida Console\", Monaco, monospace"
    })

    text = new Text('Hello World', style)

    text.x = 10
    text.y = 10
    app.ticker.add(() => {
        animationTicker(spriteList)
    })


    if (!clearBackgroundRendering) {
        window.addEventListener('beforeunload', () => {cleanPixi(spriteList)})
    }
}