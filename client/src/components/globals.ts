import * as PIXI from "pixi.js"
import {ShockwaveFilter} from 'pixi-filters'
import { round } from 'mathjs'

export let app: PIXI.Application | null = null

let clearBackgroundRendering = false

const spriteCount = 500
const SPRITE_VELOCITY = 5

interface RenderedSprite {
    sprite: PIXI.Sprite,
    vx: number,
    vy: number
}

function animationTicker(delta: number, spriteList: RenderedSprite[]) {
    console.assert(spriteCount === spriteList.length, 'Sprite count does not match sprite list length')
    for (let i = 0; i < spriteCount; i++) {
        const object = spriteList[i]

        if (object === undefined) {
            continue
        }

        if (object.sprite.x > window.innerWidth) {
            object.sprite.x = -object.sprite.width
        }

        if (object.sprite.x < -object.sprite.width) {
            object.sprite.x = window.innerWidth
        }

        if (object.sprite.y > window.innerHeight) {
            object.sprite.y = -object.sprite.height
        }

        if (object.sprite.y < -object.sprite.height) {
            object.sprite.y = window.innerHeight
        }

        // If object is close to another object, move away from it
        for (let j = 0; j < spriteCount; j++) {
            if (i === j) {
                continue
            }

            const otherObject = spriteList[j]

            if (otherObject === undefined) {
                continue
            }

            const dx = object.sprite.x - otherObject.sprite.x
            const dy = object.sprite.y - otherObject.sprite.y

            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 15) {
                object.vx = Math.min(Math.abs(object.vx + dx / distance), SPRITE_VELOCITY)
                object.vy = Math.min(Math.abs(object.vy + dy / distance), SPRITE_VELOCITY)

                object.sprite.width = 10
                object.sprite.height = 10
            }
        }

        object.sprite.x += Math.min(object.vx, object.vx + delta)
        object.sprite.y += Math.min(object.vy, object.vy + delta)

        const VELOCITY_SLOWDOWN = 0.01

        // Return to original size over time
        if (Math.abs(object.sprite.width - 20) > 0.1) {
            object.sprite.rotation += 0.1
            object.sprite.width += 0.2
            object.sprite.height += 0.2
        }

        // Return to original velocity over time
        if (Math.abs(object.vx) > 0) {
            object.vx -= Math.sign(object.vx) * VELOCITY_SLOWDOWN

            if (Math.abs(object.vx) < 0.3) {
                object.vx = 0
            }
        } else {
            if (Math.abs(object.sprite.x - window.innerWidth / 2) < 20) {
                object.vx = 0

                continue
            }

            if (object.sprite.x > window.innerWidth / 2) {
                object.vx -= SPRITE_VELOCITY / 10
            } else {
                object.vx += SPRITE_VELOCITY / 10
            }
        }

        if (Math.abs(object.vy) > 0) {
            object.vy -= Math.sign(object.vy) * VELOCITY_SLOWDOWN

            if (Math.abs(object.vy) < 0.3) {
                object.vy = 0
            }
        }
        else {
            if (Math.abs(object.sprite.y - window.innerHeight / 2) < 20) {
                object.vy = 0

                continue
            }

            if (object.sprite.y > window.innerHeight / 2) {
                object.vy -= SPRITE_VELOCITY / 10
            } else {
                object.vy += SPRITE_VELOCITY / 10
            }
        }
    }
}

let spriteList: RenderedSprite[] = []

function cleanPixi(spriteList: RenderedSprite[]) {
    if (app === null) {
        return
    }

    console.log('Clearing PIXI')

    app.stage.filters.forEach((filter) => {
        filter.enabled = false
    })

    console.log('Destroying Children')
    app.stage.removeChildren()
    app.destroy()

    for (let i = 0; i < spriteCount; i++) {
        const object = spriteList[i]
        if (object === undefined) {
            continue
        }

        object.sprite.destroy()
    }

    console.log('Destroying PIXI')


    spriteList = []

    clearBackgroundRendering = true
}


export function loadBackgroundRendering(id: string) {
    if (app) {
        cleanPixi(spriteList)
    }

    console.log('Setting up PIXI!!')

    app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        resizeTo: window,
        antialias: true,
        backgroundColor: 0xFFFFFF,
    })

    const testElement = document.getElementById(id)

    if (testElement === null) {
        return
    }

    app.stage.filters = []

    const spriteTexture = PIXI.Texture.from('https://dev.citadel:3001/VisLablogo-cropped-notitle.svg')

    spriteList = []
    for (let i = 0; i < spriteCount; i++) {
        const sprite = new PIXI.Sprite(spriteTexture)
        spriteList.push({
            sprite: sprite,
            vx: (Math.random() - 1) * SPRITE_VELOCITY,
            vy: (Math.random() - 1) * SPRITE_VELOCITY
        })
        sprite.width = 20
        sprite.height = 20
        sprite.anchor.set(0.5)
        sprite.rotation = Math.random() * Math.PI * 2


        sprite.x = Math.random() * window.innerWidth
        sprite.y = Math.random() * window.innerHeight;
        app.stage.addChild(sprite)
    }

    app.ticker.add((delta) => {
        animationTicker(delta as number, spriteList)
    })

    // Clear children of test div
    testElement.innerHTML = ''

    document.getElementById(id)?.appendChild(app.view)

    if (!clearBackgroundRendering) {
        window.addEventListener('beforeunload', () => cleanPixi(spriteList))
    }
}