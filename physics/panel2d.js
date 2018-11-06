import {POINTER_RELEASE} from '../boilerplate/pointer'

const $ = (sel) => document.querySelector(sel)
const on = (elem, type, cb) => elem.addEventListener(type,cb)
const toRad = (deg) => deg * Math.PI/180
import {POINTER_CLICK, POINTER_ENTER, POINTER_EXIT, POINTER_PRESS, POINTER_MOVE, Pointer} from '../boilerplate/pointer.js'

export default class Panel2D extends THREE.Object3D {
    constructor(scene,camera) {
        super()

        this.scene = scene
        this.camera = camera
        this.canvas = document.createElement('canvas')
        this.canvas.width = 256
        this.canvas.height = 512
        this.canvasTexture = new THREE.CanvasTexture(this.canvas)

        const c = this.canvas.getContext('2d')
        c.fillStyle = 'red'
        c.fillRect(0,0,this.canvas.width,this.canvas.height)

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1,2),
            new THREE.MeshBasicMaterial({color:'white',map:this.canvasTexture})
        )
        this.mesh.userData.clickable = true
        this.comps = []

        this.add(this.mesh)

        let inside = null
        on(this.mesh,POINTER_MOVE,(e)=>{
            const uv = e.intersection.uv
            const fpt = new THREE.Vector2(uv.x*256, 512-uv.y*512)
            if(inside && !inside.contains(fpt)) {
                inside.fire(POINTER_EXIT)
                inside = null
            }
            for(let i=0; i<this.comps.length; i++) {
                const comp = this.comps[i]
                if(comp.contains(fpt)) {
                    if(inside !== comp){
                        if(inside) inside.fire(POINTER_EXIT)
                        inside = null
                    }
                    comp.fire(POINTER_ENTER)
                    inside = comp
                }
            }
        })
        on(this.mesh,POINTER_CLICK,(e)=>{
            const uv = e.intersection.uv
            const fpt = new THREE.Vector2(uv.x*256, 512-uv.y*512)
            for(let i=0; i<this.comps.length; i++) {
                const comp = this.comps[i]
                if(comp.contains(fpt)) {
                    comp.fire(POINTER_CLICK)
                }
            }
        })

        this.header = new THREE.Mesh(
            new THREE.BoxGeometry(1.0,0.1,0.1),
            new THREE.MeshBasicMaterial({color:'goldenrod'})
        )
        this.header.userData.clickable = true
        this.header.position.set(0,1.1,0)
        this.add(this.header)

        on(this.header,POINTER_ENTER,(e)=>{
            this.header.material.color.set('yellow')
        })
        on(this.header,POINTER_EXIT,(e)=>{
            this.header.material.color.set('goldenrod')
        })
        on(this.header,POINTER_PRESS,e => this.startDrag())
    }

    push(comp) {
        this.comps.push(comp)
    }

    redraw() {
        const ctx = this.canvas.getContext('2d')
        ctx.fillStyle = 'white'
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
        this.comps.forEach(comp => comp.draw(ctx))
        this.canvasTexture.needsUpdate = true
    }

    startDrag() {
        this.header.userData.clickable = false
        this.mesh.userData.clickable = false

        this.dragSphere = new THREE.Mesh(
            new THREE.SphereGeometry(4,32,32),
            new THREE.MeshLambertMaterial({
                color:'green',
                wireframe:true,
                side: THREE.BackSide
            })
        )
        this.dragSphere.userData.clickable = true
        this.scene.add(this.dragSphere)

        on(this.dragSphere,POINTER_MOVE,(e)=> this.moveDrag(e))
        on(this.dragSphere,POINTER_RELEASE,(e)=> this.endDrag(e))

    }
    endDrag() {
        this.scene.remove(this.dragSphere)
        this.dragSphere.userData.clickable = false
        this.header.userData.clickable = true
        this.mesh.userData.clickable = true
    }


    moveDrag(e) {
        this.position.copy(e.point)
        this.position.add(new THREE.Vector3(0,-1,0))
        this.lookAt(this.camera.position)
    }
}