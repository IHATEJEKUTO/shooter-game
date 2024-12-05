const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

const score = document.querySelector('#score')
const actualScore = document.querySelector('#bigScore')
const startUi = document.querySelector('#startUi')
const startGameButton = document.getElementById("startGamebtn")

//classes
class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;


    }

    instance(){ //instance player by DRAWING it!

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        


    }
}

class Projectile{
    constructor(x, y, velocity, radius, color){
        this.radius = radius
        this.color = color
        this.x = x
        this.y = y
        this.velocity = velocity


    }

    instance(){ 

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()

    }

    physics_update(){
        this.instance()
        this.x = this.x + this.velocity.x * 20
        this.y = this.y + this.velocity.y * 20

    }
}

class Enemy{
    constructor(x, y, velocity, radius, color){
        this.radius = radius
        this.color = color
        this.x = x
        this.y = y
        this.velocity = velocity


    }

    instance(){ 

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    physics_update(){
        this.instance()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y 

    }
}

const frict = 0.99
class Particle{
    constructor(x, y, velocity, radius, color){
        this.radius = radius
        this.color = color
        this.x = x
        this.y = y
        this.velocity = velocity
        this.alpha = 1
    }

    instance(){ 
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }

    physics_update(){
        this.instance()
        this.velocity.x *= frict
        this.velocity.y *= frict
        this.x = this.x + this.velocity.x 
        this.y = this.y + this.velocity.y 
        this.alpha -= 0.01
    }
}
let player = new Player(canvas.width/2, canvas.height/2, 10, 'white')
let projectiles = [];
let enemies = [];
let particles = []

function init(){
    score.innerHTML = '0'
    newScore = 0
    player = new Player(canvas.width/2, canvas.height/2, 10, 'white')
    projectiles = [];
    enemies = [];
    particles = [];
}

function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (30-4) + 4
        let x
        let y
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius 
            y = Math.random() * canvas.height


        } else{
            x = Math.random() * canvas.width 
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl(${Math.random()*360}, 50%, 50%)`
        
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        
    
        enemies.push(new Enemy(x, y, velocity, radius, color))

    }, 1000)

    

}
//----------------------------------------------------------



const playerProjectile = new Projectile(player.x, player.y, {x: 1, y: 1}, 5, 'red')
player.instance()



let animationId;
let newScore = 0
let highScore = 0
let addedTotal = 0;
//updates each frame
function animate(){
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    
    player.instance()

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index)
        }
        else{
            particle.physics_update()
        }

    })

    projectiles.forEach((playerProjectile, index) =>{
        playerProjectile.physics_update()
        
    
        if(playerProjectile.x + playerProjectile.radius < 0 || playerProjectile.x - playerProjectile.radius > canvas.width
        || playerProjectile.y + playerProjectile.radius < 0 || playerProjectile.y - playerProjectile.radius > canvas.height){
            setTimeout(() =>{
                projectiles.splice(index, 1)
            }, 0)
        }
    })
    
    enemies.forEach((enemy, index) => { //hitbox detection
        enemy.physics_update()
        let distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)


        if(distance - enemy.radius - player.radius < 1){ //queue free the player
            

            setTimeout(() =>{
                if(newScore > highScore){
                    highScore = newScore
                }

                actualScore.innerHTML = highScore
                cancelAnimationFrame(animationId)
                startUi.style.display = 'flex'
            }, 0)
            
        }

        projectiles.forEach((projectile, projectileIndex) =>{
            let distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            if(distance - enemy.radius - projectile.radius < 1){ 
                newScore += parseInt(10, enemy.radius)
                addedTotal += newScore
                score.innerHTML = newScore
                for(let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.x, projectile.y, {x: (Math.random() - 0.5) * (Math.random() * 8), y: (Math.random() - 0.5) * (Math.random() * 8)}, Math.random() * 2, enemy.color))
                        
                    
                
                }

                if(enemy.radius - 8 > 10){
                    gsap.to(enemy, {radius: enemy.radius - 5})
                    setTimeout(() =>{
                        projectiles.splice(projectileIndex, 1)
                        
                    }, 0)

                }
                else{ //queue free the enemy
                    setTimeout(() =>{
                        newScore += (addedTotal/100)|10
                        score.innerHTML = newScore
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                        addedTotal = 0;
                    }, 0)
                }
                
            }
        })
        
    })

}

window.addEventListener('click', (event) =>{
    const angle = Math.atan2(event.clientX - canvas.width/2, event.clientY - canvas.height/2)
    const velo = {
        x: Math.sin(angle),
        y: Math.cos(angle)
    }
    projectiles.push(new Projectile(player.x, player.y, velo, 5, 'red'))

})

startGameButton.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    startUi.style.display = 'none'
})
