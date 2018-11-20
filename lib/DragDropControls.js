/*
* @author zz85 / https://github.com/zz85
* @author mrdoob / http://mrdoob.com
* Running this will allow you to drag three.js objects around the screen.
*/
// const THREE = require('three')

THREE.DragDropControls = function (_objects, _camera, _domElement, _dropObjects, options) {
	var _plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
	var _raycaster = new THREE.Raycaster();
	var _raycasterDrop = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();

	var scope = this,
		_selected = null,
		_hovered = null,
		_hoveredDrop = null,
		_activated = false,
		_arrowHelper = null,
		_arrowHelperPlane = new THREE.Plane(new THREE.Vector3(0,0,1),0),
		_planeHelper = null,
		_fixedDragPlaneNormal = new THREE.Vector3(0, 0, -1),
		_options = {
			setCursor: true,
			addPlaneHelper: false,
			addArrowHelper: false,
			scene: null,
			fixDragPlane: true
		}

	_dropObjects = _dropObjects || []

	function setOptions(options) {
		if (options.hasOwnProperty('setCursor')) {
			_options.setCursor = options.setCursor
		}
		if (options.hasOwnProperty('scene')) {
			_options.scene = options.scene
		}
		if (options.hasOwnProperty('addPlaneHelper')) {
			_options.addPlaneHelper = _options.scene && options.addPlaneHelper
			addPlaneHelper()
		}
		if (options.hasOwnProperty('addArrowHelper')) {
			_options.addArrowHelper = _options.scene && options.addArrowHelper
		}
		if (options.hasOwnProperty('fixDragPlane')) {
			_options.fixDragPlane = options.fixDragPlane
		}
	}

	function addPlaneHelper() {
		if (!_options.scene) { return }
		_options.scene.remove(_planeHelper)
		_planeHelper = new THREE.PlaneHelper(_plane, 10, 10)
		if (!_options.addPlaneHelper) { return }
		_options.scene.add(_planeHelper)
	}

	/**
	 * 
	 * @param {THREE.Ray} ray 
	 */
	function addArrowHelper(ray) {
		if (!_options.addArrowHelper) { return }
		_options.scene.remove(_arrowHelper)
		if (!ray) { return }
		_arrowHelper = new THREE.ArrowHelper(ray.direction, ray.origin, ray.distanceToPlane(_arrowHelperPlane))
		_options.scene.add(_arrowHelper)
	}

	function setCursor(cursor) {
		if (!_options.setCursor) { return }
		_domElement.style.cursor = cursor
	}

	function getDragPlaneNormal() {
		return _options.fixDragPlane
			? _fixedDragPlaneNormal
			: _camera.getWorldDirection(_plane.normal)
	}

	function activate() {
		_domElement.addEventListener('mousemove', onDocumentMouseMove, false);
		_domElement.addEventListener('mousedown', onDocumentMouseDown, false);
		_domElement.addEventListener('mouseup', onDocumentMouseCancel, false);
		_domElement.addEventListener('mouseleave', onDocumentMouseCancel, false);
		_domElement.addEventListener('touchmove', onDocumentTouchMove, false);
		_domElement.addEventListener('touchstart', onDocumentTouchStart, false);
		_domElement.addEventListener('touchend', onDocumentTouchEnd, false);

		this.activated = true
	}

	function deactivate() {
		_domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
		_domElement.removeEventListener('mousedown', onDocumentMouseDown, false);
		_domElement.removeEventListener('mouseup', onDocumentMouseCancel, false);
		_domElement.removeEventListener('mouseleave', onDocumentMouseCancel, false);
		_domElement.removeEventListener('touchmove', onDocumentTouchMove, false);
		_domElement.removeEventListener('touchstart', onDocumentTouchStart, false);
		_domElement.removeEventListener('touchend', onDocumentTouchEnd, false);

		this.activated = false
	}

	function onDocumentMouseDown(event) {
		event.preventDefault();
		if (!scope.enabled) { return }

		_raycaster.setFromCamera(_mouse, _camera);
		var intersects = _raycaster.intersectObjects(_objects);

		if (intersects.length > 0) {
			_selected = intersects[0].object;
			_plane.setFromNormalAndCoplanarPoint(getDragPlaneNormal(), _selected.position);
			if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
				// this is the offset between the mouse coords and the object center
				// later used to drag object keeping that same offset
				_offset.copy(_intersection).sub(_selected.position);
			}
			setCursor('move')
			scope.dispatchEvent({ type: 'dragstart', object: _selected });
		}
	}

	function onDocumentMouseMove(event, isTouch) {
		event.preventDefault();
		if (!scope.enabled) { return }
		event = isTouch ? event.changedTouches[0] : event

		var rect = _domElement.getBoundingClientRect();
		_mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		_mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
		_raycaster.setFromCamera(_mouse, _camera);

		// ## this part is in case of drag
		if (_selected) {
			// copies into _intersection the point where ray intercepts plane
			if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
				// without .sub(_offset) object aligns center to mouse coords
				_selected.position.copy(_intersection.sub(_offset));
				intersectDropObjects()
			}
			scope.dispatchEvent({ type: 'drag', object: _selected });

			return;
		}
		// ## this part in case of hover, if touch device exit here
		if (isTouch) { return }

		var intersects = _raycaster.intersectObjects(_objects);
		if (intersects.length > 0) {
			var object = intersects[0].object;
			if (_hovered !== object) {
				scope.dispatchEvent({ type: 'hoveron', object: object });
				setCursor('pointer')
				_hovered = object;
			}
		} else if (_hovered !== null) {
			scope.dispatchEvent({ type: 'hoveroff', object: _hovered });
			setCursor('auto')
			_hovered = null;
		}
	}

	function onDocumentMouseCancel(event) {
		event.preventDefault();
		if (!scope.enabled) { return }

		if (_selected) {
			scope.dispatchEvent({ type: 'dragend', object: _selected, objectDrop: _hoveredDrop });
			_selected = null;
			_hoveredDrop = null
		}
		setCursor(_hovered ? 'pointer' : 'auto')
		addArrowHelper(null)
	}

	function onDocumentTouchStart(event) {
		event.preventDefault();
		if (!scope.enabled) { return }
		var _event = event.changedTouches[0];

		var rect = _domElement.getBoundingClientRect();
		_mouse.x = ((_event.clientX - rect.left) / rect.width) * 2 - 1;
		_mouse.y = - ((_event.clientY - rect.top) / rect.height) * 2 + 1;
		onDocumentMouseDown(event)
	}

	function onDocumentTouchMove(event) {
		onDocumentMouseMove(event, true)
	}

	function onDocumentTouchEnd(event) {
		onDocumentMouseCancel(event)
	}

	function intersectDropObjects() {
		// set raycaster to shoot ray from object center with same direction as drag plane normal
		_raycasterDrop.set(_selected.position, _plane.normal.clone())
		addArrowHelper(_raycasterDrop.ray)

		var intersects = _raycasterDrop.intersectObjects(_dropObjects);

		if (intersects.length > 0) {
			var object = intersects[0].object
			if (_hoveredDrop !== object) {
				scope.dispatchEvent({ type: 'hoveronDrop', object: _selected, objectDrop: object });
				setCursor('copy')
				_hoveredDrop = object;
			}
		}
		else if (_hoveredDrop !== null) {
			scope.dispatchEvent({ type: 'hoveroffDrop', object: _selected, objectDrop: _hoveredDrop });
			setCursor('move')
			_hoveredDrop = null;
		}
	}

	setOptions(options)
	activate();

	// API
	this.enabled = true;
	this.activate = activate;
	this.deactivate = deactivate;
	this.setOptions = setOptions

	Object.defineProperty(this, 'activated', {
		get() {
			return this.activated
		}
	})
};

THREE.DragDropControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.DragDropControls.prototype.constructor = THREE.DragDropControls;

