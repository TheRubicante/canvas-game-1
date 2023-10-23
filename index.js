


/*constant initialization*/
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

/*canvas initialization*/
canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const modalScore = document.querySelector('#modalScore')
/*
simple class for circular player
*/
class Player {
	constructor(x, y, radius, color) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color		
	}

	draw() {
		ctx.beginPath()
		ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
	}
}

/*
class for projectiles, similar to player but with a velocity parameter
*/
class Projectile {
	constructor(x,y,radius,color,velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}

	draw() {
		ctx.beginPath()
		ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
	}

	update() {
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y

	}

}

class Enemy {
	constructor(x,y,radius,color,velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}

	draw() {
		ctx.beginPath()
		ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
	}

	update() {
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y

	}

}

const pFriction = 0.99
class Particle {
	constructor(x,y,radius,color,velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
		this.alpha = 1
	}

	draw() {
		ctx.save()
		ctx.globalAlpha = this.alpha
		ctx.beginPath()
		ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.restore()
	}

	update() {
		this.draw()
		this.velocity.x *= pFriction
		this.velocity.y *= pFriction
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
		this.alpha -= 0.01
	}

}


const centerX = canvas.width / 2
const centerY = canvas.height / 2

let player = new Player(centerX,centerY, 15, 'white')
let projectiles = []
let enemies = []
let particles = []

function init(){

	score=0
	modalScore.innerHTML = score
	scoreEl.innerHTML = score
	player = new Player(centerX,centerY, 15, 'white')
 	projectiles = []
 	enemies = []
 	particles = []
}


//Ternary Operator for conditional value
// [variable] = [condition] ? [true Value] : [false Value]

function spawnEnemies() {
	 setInterval(()=>{
		const radius = Math.random()*25+5
		
		let x
		let y

		if (Math.random()<0.5){

			x = Math.random()<0.5 ? 0-radius : canvas.width+radius
			y = Math.random()*canvas.height 
		} else {
			x = Math.random()*canvas.width 
			y = Math.random()<0.5 ? 0-radius : canvas.height+radius
		}
		//backticks as "template literal" to include computation in string
		const color = `hsl(${Math.random()*360},50%,50%)`
		const pAngle = Math.atan2(centerY-y,centerX-x)
		const velocity = {x:Math.cos(pAngle),y:Math.sin(pAngle)}
		enemies.push(new Enemy(x,y,radius,color,velocity))		
	},1000)

}

let animationID
let score = 0
function animate() {
	animationID = requestAnimationFrame(animate)
	ctx.fillStyle= 'rgba(0,0,0,0.1)'
	ctx.fillRect(0,0,canvas.width,canvas.height)
	player.draw()
	particles.forEach((particle,index)=>{
		if (particle.alpha<=0){
			setTimeout(()=> {
				particles.splice(index,1)
				},0)
		}
		else{
		particle.update()
		}
	})
	projectiles.forEach((projectile,pIndex)=> 
	{
		projectile.update()

		if(projectile.x+projectile.radius < 0 || projectile.x-projectile.radius>canvas.width || projectile.y+projectile.radius < 0 || projectile.y-projectile.radius > canvas.height) {
			setTimeout(()=> {
				projectiles.splice(pIndex,1)
				},0)
		}
	})
	enemies.forEach((enemy, index)=> 
	{
		enemy.update()
		const dist=	Math.hypot(player.x-enemy.x,player.y-enemy.y)
		//enemy hits player
			if (dist-enemy.radius-player.radius < 1){
				cancelAnimationFrame(animationID)
				modalScore.innerHTML = score
				modalEl.style.display = 'flex'

			}

		projectiles.forEach((projectile,pIndex) =>{
			const dist=	Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y)
			
			//projectiles collide with enemy
			if (dist-enemy.radius-projectile.radius < 1){




				//create explosions
				for (let i = 0; i<projectile.radius*3; i++){
					particles.push(new Particle(projectile.x,projectile.y,Math.random()*3+1,
						enemy.color,
						{x:(Math.random()-0.5)*(Math.random()*8), 
						y:(Math.random()-0.5)*(Math.random()*8) }))
				}

				if (enemy.radius - 10 > 5) {
					//reduce
					//increase our score
					score += 100
					scoreEl.innerHTML = score
					//animation to "tween" shrink enemies
					gsap.to(enemy, {
						radius:enemy.radius-10
					})

					projectiles.splice(pIndex,1)
				} else {
					//remove
					//increase our score
					score += 250
					scoreEl.innerHTML = score
					setTimeout(()=> {
						enemies.splice(index,1)
						projectiles.splice(pIndex,1)
						},0)
				}
			}
		})
	})
}

/*
catching client clicks
console.log(event) to find what properties the click event has
*/
addEventListener('click',(event) => {
	const pAngle = Math.atan2(event.clientY-centerY,event.clientX-centerX)
	const velocity = {x:Math.cos(pAngle)*5,y:Math.sin(pAngle)*5}
	projectiles.push(new Projectile(centerX,centerY,5,'red',velocity))


})

startGameBtn.addEventListener('click',(event) => {
	init()
	animate()
	spawnEnemies()
	modalEl.style.display = 'none'
})





//29:52