const ProximityButton = () => {


	let watcher = React.useRef()
	let el = React.useRef()
	let elBtnDiv = React.useRef()
	let arrowSpan = React.useRef()
	
	
	

	const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

	const closestCollisionPoint = (el, mouseX, mouseY) => {
		// get closest collision course [button, mouse]
		bounds = el.current.getBoundingClientRect()

		buttonXClamp = clamp(mouseX, bounds.left, bounds.right)
		buttonYClamp = clamp(mouseY, bounds.top, bounds.bottom)

		isVertical = (mouseY >= bounds.bottom || mouseY <= bounds.top) && (mouseX >= bounds.left && mouseX <= bounds.right)
		isHorizontal = (mouseX >= bounds.right || mouseX <= bounds.left) && (mouseY >= bounds.top && mouseY <= bounds.bottom)
		isCorner = !isVertical && !isHorizontal
		//console.log(`isVertical: ${isVertical}, isHorizontal: ${isHorizontal}, isCorner: ${isCorner}`)
		return {x: buttonXClamp, y: buttonYClamp, vertical: isVertical, horizontal: isHorizontal, corner: isCorner}

	}

	const getAngle =(buttonX, buttonY, mouseX, mouseY) => {
		dx = mouseX - buttonX
		dy = mouseY - buttonY



		forCSS = -(Math.atan2(dx, dy) * 180 / Math.PI).toFixed(2) // dx and dy flipped works for css degrees
		angleT = -(Math.atan2(dy, dx) * 180 / Math.PI).toFixed(2) 
		degrees = angleT < 0 ? (360 - (Math.abs(angleT) % 360)) : angleT // angle [0, 360] from center of div to mouse


		x = (degrees >= 91 && degrees <= 270) ? 'left' : 'right'
		y = (degrees >=0 && degrees <= 180) ? 'top' : 'bottom'

		return {forCSS, degrees, y, x}

	}

	const distance = (y2, y1, x2, x1) => Math.floor(Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)))

	let eventFn = (e) => {
		console.group("inside watcher")

		// TODO: calculate const values as form of cache
		bounds = el.current.getBoundingClientRect()
		watcherBounds = watcher.current.getBoundingClientRect()
		elCenter = [(bounds.left + (bounds.width / 2)), (bounds.top + (bounds.height / 2))]
		elCorners = {
			'top-right': [bounds.right, bounds.top],
			'top-left': [bounds.left, bounds.top],
			'bottom-left': [bounds.left, bounds.bottom],
			'bottom-right': [bounds.right, bounds.bottom]
		}
		elAngles = {}		
		// get the angles of the target's four corners
		Object.keys(elCorners).forEach((item, index) => {
			let [buttonX, buttonY] = elCorners[item]
			angle = getAngle(buttonX, buttonY, elCenter[0], elCenter[1])
			elAngles = Object.defineProperties(elAngles, {
				[`${angle.y}-${angle.x}`]: {
					value: angle.degrees,
					writable: true
				}
			})
		})

		maxDist = {
			vertical: watcherBounds.bottom - bounds.bottom,
			horizontal: watcherBounds.right - bounds.right,
			corner: distance(bounds.top, watcherBounds.top, bounds.right, watcherBounds.right)
		}

		let fnn = function(e) {
			watcher.current.addEventListener('mousemove', function(e) {
				mouse = {x: e.pageX, y: e.pageY}
				collisionPoint = closestCollisionPoint(el, mouse.x, mouse.y)
				button = collisionPoint

				var progress, pixels
				dist = clamp(distance(button.y, mouse.y, button.x, mouse.x), 0, 150)

				button.vertical 
					? (progress = dist / maxDist.vertical, pixels = progress * maxDist.vertical)
					: button.horizontal
						? (progress = dist / maxDist.horizontal, pixels = progress * maxDist.horizontal)
						: (progress = dist / maxDist.corner, pixels = progress * maxDist.corner)

				inverseProgress = 1 - progress

				arrowSpan.current.style.transform = `translate(${30 * progress}px)` // arrow distance from initial position * progress from watcher to button
				el.current.style.border = `2px solid rgba(170, 190, 201, ${inverseProgress})`

				progress < 0.5
					? elBtnDiv.current.style.background = `-webkit-linear-gradient(0deg, rgba(${255 * inverseProgress}, 0, 0, 1), rgba(0, 0, ${255 * inverseProgress}, 1))`
					: elBtnDiv.current.style.background = `-webkit-linear-gradient(0deg, rgba(${255 * inverseProgress}, 0, 0, 1), rgba(0, 0, ${255 * inverseProgress}, 1))`

				elBtnDiv.current.style.textShadow = 
					`0 0 ${10 * inverseProgress}px rgba(255, 105, 180, ${inverseProgress}), 
					0 0 ${20 * inverseProgress}px rgba(255, 105, 180, ${inverseProgress}), 
					0 0 ${80 * inverseProgress}px rgba(255, 105, 180, ${inverseProgress}), 
					0 0 ${100 * inverseProgress}px rgba(255, 105, 180, ${inverseProgress})`

				elBtnDiv.current.style.webkitBackgroundClip = 'text'
				elBtnDiv.current.style.webkitTextFillColor = 'transparent'

			}, {once: true})

		}
		let interval = setInterval(fnn, 25, e)

		watcher.current.addEventListener('mouseleave', function() {
			clearInterval(interval)
			arrowSpan.current.style.transform = null
			el.current.style.border = null
			elBtnDiv.current.style = ''
			//watcher.current.firstElementChild.style = null

			console.log("exit watcher, removing interval")
			console.groupEnd()
		}, {once: true})

	}
	

	React.useEffect(() => {
		watcher.current.addEventListener('mouseenter', eventFn)
	})
	
	return (
	  <div ref = { watcher } id="btn-cursor-watcher">
		<button ref = { el } className="btn-animated">
		  <div ref={ elBtnDiv }>
			<p>SEE PRODUCT</p>
			<span ref={ arrowSpan } id="arrow">→</span>
		  </div>
		</button>
	  </div>
	)
}

export default ProximityButton
