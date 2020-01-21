if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var renderer, scene, camera, stats, raycaster, clock;
var mouse2D = new THREE.Vector2();
var intersection = null;
var mouseDown;
var highlightMode = false;
var threshold = 0.5, pointSize = 1;

// data structures
var boundingBoxes = [], hoverBoxes = [];
var image_loaded = false;
var newBox, newBoundingBox, newBoxHelper;

var mouse = new THREE.Vector3(), anchor = new THREE.Vector3();
var currentPosition = new THREE.Vector3();

var boxgeometry = new THREE.BoxGeometry( 1, 1, 1 );
var boxmaterial = new THREE.MeshDepthMaterial( {opacity: .1} );
var selectedBox;
var angle;
var hoverIdx, hoverBox;
var resizeBox, rotatingBox;
var isResizing = false;
var isMoving = false;
var isRotating = false;
var grid;
var pointMaterial = new THREE.PointsMaterial( { size: pointSize * 8, sizeAttenuation: false, vertexColors: THREE.VertexColors } );

var isRecording = true;
var app;
var mean, sd, filteredIntensities, min, max, intensities, colors;
var selected_color = new THREE.Color(0x78F5FF);
var hover_color = new THREE.Color(1, 0, 0);
var default_color = new THREE.Color(0xffff00);
var autoDrawMode = false;

var mouse2D2 = new THREE.Vector2();
var mouse_click = new THREE.Vector3();
var enable_point_touching = false;
var save_points = [];
var sphereInter;
var pointcloud;
var pause_highlight = false;
 var intersecting;
init();


// called first, populates scene and initializes renderer
function init() {

    var container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    // scene.background = new THREE.Color( 0xffffff );
    clock = new THREE.Clock();

    // set up PerspectiveCamera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 100, 0);
    camera.lookAt(new THREE.Vector3(0,0,0));

    //
    grid = new THREE.GridHelper( 200, 20, 0xffffff, 0xffffff );
    // scene.add( grid );

    // set up renderer
    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    //
    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = threshold;

    //
    stats = new Stats();
    container.appendChild( stats.dom );

    //
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
    document.getElementById('container').addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.getElementById('container').addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.getElementById('container').addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'mousemove', updateMouse, false );
    document.getElementById( 'save' ).addEventListener( 'click', write_frame_out, false );
    document.getElementById( 'move' ).addEventListener( 'click', moveMode, false );
    document.getElementById( 'move2D' ).addEventListener( 'click', move2DMode, false );
    document.getElementById( 'start_interacting' ).addEventListener('click', startInteractive, false);
    document.getElementById( 'save_points' ).addEventListener('click', save_point_file, false);
//     document.addEventListener("keydown", onKeyDown2);  //or however you are calling your method
    document.addEventListener("keyup", onKeyUp2);
    document.addEventListener("keydown", on_Key_Down);
    // document.getElementById( 'record' ).addEventListener( 'click', toggleRecord, false );

    window.onbeforeunload = function(evt) {
        return true;
    }
    app = new App();
    app.init();
}

function write_frame_out() {
    app.write_frame_out();
}
// function write_frame() {
//     evaluator.pause_recording();
//     evaluation.add_evaluator(evaluator);
//     evaluation.write_frame();
// }


function save_point_file(){
    
    var name = app.cur_frame.fname;
    console.log("saving to file " + name);
    json_string = JSON.stringify(save_points);
//     require('fs').writeFile(

//     './'+name+'.json',

//     JSON.stringify(save_points),

//     function (err) {
//         if (err) {
//             console.error('Crap happens');
//         }
//     }
//     );
    uriContent = "data:application/octet-stream," + encodeURIComponent(json_string);
    newWindow = window.open(uriContent, name+'neuesDokument');

}

function startInteractive(){
//     console.log("Starting interactive .............")
//     camera.lookAt(scene.position);
    camera.updateMatrix();

//     var SphereGeometry = new THREE.SphereBufferGeometry(0.1, 32, 32 );
//     var material = new THREE.MeshBasicMaterial({color: 0xff0000});
//     pointSphere = new THREE.Mesh(SphereGeometry, material);
//     pointSphere.visible = false;
//     scene.add(pointSphere);
    
    if(pause_highlight == false){
            var geometry = new THREE.SphereBufferGeometry( 0.05, 32, 32 );
        var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );

        sphereInter = new THREE.Mesh( geometry, material );
        sphereInter.name = "spheres"
        sphereInter.visible = false;
        scene.add( sphereInter );
    }
    


    // var loader = new THREE.FontLoader();
    // loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
    // var xMid, text;
    // var color = new THREE.Color( 0x006699 );
    // var matDark = new THREE.MeshBasicMaterial( {
    //     color: color,
    //     side: THREE.DoubleSide
    // } );
    // var matLite = new THREE.MeshBasicMaterial( {
    //     color: color,
    //     transparent: true,
    //     opacity: 0.4,
    //     side: THREE.DoubleSide
    // } );

    // var message = " Three.js\nStroke text.";
    // var shapes = font.generateShapes( message, 100 );
    // var geomeindicestry = new THREE.ShapeBufferGeometry( shapes );
    // geometry.computeBoundingBox();
    // //xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    // // make shape ( N.B. edge view not visible )
    // text = new THREE.Mesh( geometry, matLite );
    // text.position.z = 0;
    // scene.add( text );
    // } ); //end load function


    
    // window.requestAnimationFrame(render);


}

function onMouseMove( event ){
    event.preventDefault();
    mouse_click.x = mouse2D2.x;
    mouse_click.y = mouse2D2.y;

    if(pause_highlight== false ){
            console.log("saving point ");
            console.log(intersecting[0].point);
    //                     save_points.push(new THREE.Vector3( mouse_click.x, mouse_click.y, mouse_click.z));
            save_points.push(intersecting[0].point );
    }
    
}

function updateMouse_act( event ) {
//     console.log("mouse position")
    event.preventDefault();
    var rect = renderer.domElement.getBoundingClientRect();
    mouse2D2.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
    mouse2D2.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    // mouse2D2.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // mouse2D2.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // console.log("updating mouse")
}


function clearNamedMesh(given_scene, object_string){
    var to_remove = [];

    given_scene.traverse(
        function(child){
            if(child instanceof THREE.Mesh && child.name == object_string ){
                to_remove.push(child);
            }
        });
    for (var i =0; i < to_remove.length; i++){
        given_scene.remove(to_remove[i]);

    }
}

function on_Key_Down(event) {
    if(event.keyCode == 80){
        save_point_file();
    }
    // D
    if(event.ctrlKey && event.keyCode == 68){
        if (pause_highlight == true){
            
            pause_highlight = false;
        }
        else{
            alert("Pausing highlights");
            pause_highlight = true;
        }
        
    }
    
    if(event.ctrlKey && (event.keyCode == 88)){
        if(highlightPoints == true){
            console.log("Removing highlights, back to normal")
            clearNamedMesh(scene,"spheres")
            highlightPoints = false;
            save_points = [];
        }
        else{
        pause_highlight = false;
        window.addEventListener('mousemove', onMouseMove, false);
        enable_point_touching = true;
        highlightPoints = true;
        console.log("Ctrl + x pressed, start highlighting points, leftclick to show pointcloud")

        }

    }
    
}



function predictLabel(boundingBox) {
    if (!enable_predict_label) {return;}
    if (boundingBox.hasPredictedLabel == false) {
        $.ajax({
            url: '/predictLabel',
            data: JSON.stringify({frames: [{filename: app.cur_frame.fname, 
                                            bounding_boxes: [stringifyBoundingBoxes([boundingBox])[0]] }],
                                  filename: app.cur_frame.fname}),
            type: 'POST',
            contentType: 'application/json;charset=UTF-8',
            success: function(response) {
                var label = parseInt(response.split(",")[0], 10);
                var in_fov = response.split(",")[1] == "True";
                console.log(response, in_fov);
                boundingBox.hasPredictedLabel = true;
                if (label != -1) {
                   updateLabel(boundingBox.id, label);
                }
                if (in_fov) {
                    updateCroppedImagePanel('');
                } else {
                    updateCroppedImagePanel('outside FOV');
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
    }
}

function getMaskRCNNLabels(filename) {
    if (!enable_mask_rcnn) {return;}
    $.ajax({
            url: '/getMaskRCNNLabels',
            data: JSON.stringify({filename: filename}),
            type: 'POST',
            contentType: 'application/json;charset=UTF-8',
            success: function(response) {
                var l = response.length - 1;
                maskRCNNIndices = response.substring(1, l).split(',').map(Number);
                highlightPoints(maskRCNNIndices);
                updateMaskRCNNImagePanel();
            },
            error: function(error) {
                console.log(error);
            }
        });
}

function updateLabel(id, label) {
    var row = getRow(id);
    var dropDown = $(row).find("select");
    var selectedIndex = $(dropDown).prop("selectedIndex");
    $(dropDown).prop("selectedIndex", label);
    // evaluator.decrement_label_count();
    app.f
}

// gets 2D mouse coordinates
function updateMouse( event ) {
    event.preventDefault();
    mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse2D.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}


// controller for resizing, rotating, translating, or hovering boxes and points
function onDocumentMouseMove( event ) {
    event.preventDefault();
    
    updateMouse_act(event);
    
    
    if (!isRecording) {
        return;
    }
    app.handleBoxRotation();
    app.handleBoxResize();
    app.handleBoxMove();

    if (mouseDown && !isRotating && !isResizing && !isMoving) {
        if (newBox != null && !newBox.added) {
            scene.add(newBox.points);
            scene.add( newBox.boxHelper );
            newBox.added = true;
        }
        newBox.resize(app.getCursor());
    } 

        var cursor = getCurrentPosition();
        if (!controls.enabled) {
            console.log("controls not enabled");
            // highlights all hover boxes that intersect with cursor
            updateHoverBoxes(cursor);

            // highlights closest corner point that intersects with cursor
            highlightCorners();
        } 
    // } 
}


// updates hover boxes and changes their colors to blue
function updateHoverBoxes(v) {
    var boundingBoxes = app.cur_frame.bounding_boxes;
    if (!isMoving) {
        hoverBoxes = [];
        for (var i = 0; i < boundingBoxes.length; i++) {
            var box = boundingBoxes[i];
            // added box to boverBoxes if cursor is within bounding box
            if (v && containsPoint(box, v)) {
                hoverBoxes.push(box);
            }

            // checks if box is selectedBox, if so changes color back to default
            if (box != selectedBox) {
                box.changeBoundingBoxColor(default_color.clone());
            }
        }

        // update color of hover box if only one box is hovered
        if (hoverBoxes.length == 1) {
            var box = hoverBoxes[0];
            if (box != selectedBox) {
                box.changeBoundingBoxColor(hover_color.clone());
            }
        }
    }
}






var camera_angle;

// controller for adding box
function onDocumentMouseUp( event ) {
    event.preventDefault();
    if (!isRecording) {
        return;
    }
    if (isRecording) {
        app.handleAutoDraw();
        mouseDown = false;
        var predictBox = null;
        if (newBox != null && newBox.added) {
            addBox(newBox);
            newBox.add_timestamp();
            app.increment_add_box_count();
            predictBox = newBox;
        }
        newBox = null;
        if (isResizing) {
            app.increment_resize_count();
            predictLabel(resizeBox);
            predictBox = resizeBox;
        }
        if (isMoving && selectedBox) {
            app.increment_translate_count();
            predictLabel(selectedBox);
            predictBox = selectedBox;
        }
        if (isRotating) {
            app.increment_rotate_count();
            predictBox = rotatingBox;
        }
        if (predictBox) {
            predictLabel(predictBox);            
        }
        isResizing = false;
        isRotating = false;
        // if (isMoving) {
        //     changeBoundingBoxColor(hoverBoxes[0], new THREE.Color( 7,0,0 ));
        // }
        isMoving = false;


        // if (app.move2D) {
            app.increment_rotate_camera_count(camera.rotation.z);
        // }
    }
}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    if(event.buttons == 4 && enable_point_touching === true){
        canAddPcInApp = true;
        console.log("middle key pressed, showing pointcloud. highlights will be removed")
//         showingCroppedPointcloud(event)
        clearNamedMesh(scene, "spheres")
        canAddPcInApp = false;
        showCroppedPointcloud = false;
        enable_point_touching = false;
        highlightPoints = false
    }
    
    
    
    if (isRecording) {
        if (!controls.enabled) {
            mouseDown = true;
            anchor = get3DCoord();
            var intersection = intersectWithCorner();
            // update hover box
            if (selectedBox && (hoverBoxes.length == 0 || hoverBoxes[0] != selectedBox)) {
                selectedBox.changeBoundingBoxColor(0xffff00);
                selectedBox = null;
                isMoving = false;
            }

            if (intersection != null) {
                var box = intersection[0];
                var closestIdx = closestPoint(anchor, box.geometry.vertices);
                // console.log("closest: ", closestIdx);
                if (closestIdx == 4) {
                    isRotating = true;
                    rotatingBox = box;
                } else {
                    isResizing = true;
                    resizeBox = box;
                    resizeBox.anchor = resizeBox.geometry.vertices[getOppositeCorner(closestIdx)].clone();
                }
            } else if (hoverBoxes.length == 1) {
                isMoving = true;
                hoverBoxes[0].select(get3DCoord());
                selectRow(selectedBox.id);

            } else {
                angle = camera.rotation.z;
                var v = anchor.clone();
                anchor.x += .000001;
                anchor.y -= .000001;
                anchor.z += .000001;
                newBoundingBox = new THREE.Box3(anchor, v);
                newBoxHelper = new THREE.Box3Helper( newBoundingBox, 0xffff00 );
                anchor = anchor.clone();

                newBox = new Box(anchor, v, angle, newBoundingBox, newBoxHelper);
            }
        }
    }
    render();
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}

/* Gets the 3D cursor position that is projected onto the z plane */
function getCurrentPosition() {
    var temp = new THREE.Vector3(mouse2D.x, mouse2D.y, 0);
    temp.unproject( camera );
    var dir = temp.sub( camera.position ).normalize();
    var distance = - camera.position.y / dir.y;
    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
    return pos;
}

var toggle = 0;
function render() {
    toggle += clock.getDelta();
    
    if(enable_point_touching){
        if(highlightPoints === true){
//             console.log("highlighting points, starting interactive session ...")
            startInteractive()
        }

        
        //camera.applyMatrix(rotateY);
        //camera.updateMatrixWorld();
        
        raycaster.setFromCamera(mouse_click, camera);

        // calculate intercecting mouse ray and object
        pointcloud = scene.getObjectByName( "pointcloud", true );
        intersecting = raycaster.intersectObject(pointcloud);

        intersection = (intersecting.length > 0)? intersecting[0] : null;

//         time_toggle += clock.getDelta();

        if ( intersecting.length > 0 ) {
//                     document.getElementById("container").classList.remove('change_color');
//                     document.getElementById("container").classList.add('add_crosshair');
                    sphereInter.visible = true;
//                     console.log("No visible")
                    sphereInter.position.copy( intersecting[ 0 ].point );
//                     console.log("intersecting point")
//                     console.log(intersecting[ 0 ].point)
                    mouse_click.z = intersecting[0].point.z
                sphereInter.radius= 1;

                    

            } else {

                // sphereInter.visible = false;
//                 console.log("No intersection ")
                document.getElementById("container").classList.add('change_color');
                document.getElementById("container").classList.remove('add_crosshair');
                sphereInter.visible = false;
                // sphereInter.geometry.colors = new THREE.Color(1,0,0)
                // mouse_click.unproject( camera );
                // sphereInter.position.copy(new THREE.Vector3(mouse_click.x, mouse_click.y, mouse_click.z));
                // sphereInter.radius = 0.5;
                // sphereInter.geometry.needsUpdate = true;
            }

        // for (var i =0; i < intersecting.length; i++){
        //     intersecting[i].object.material.color.set(0xff000);
        // }
        //onsole.log(time_toggle)
        renderer.render(scene, camera);
    }
    else{
        renderer.render( scene, camera );
    }

    app.render_text_labels();

    if (app.move2D) {
        grid.rotation.y = camera.rotation.z;
    }
    update_footer(getCurrentPosition());
    
    
    
    

    
    
    
}

function update_footer(pos) {
    var reminder_text = "";
    if (isRecording) {
        if (app.move2D) {
            if (controls.enabled == true) {
                reminder_text = "Hold control key and click on point cloud to start drawing bounding box";
            } else {
                if (isResizing) {
                    reminder_text = "Release mouse to stop resizing box";
                } else if (isMoving) {
                    reminder_text = "Release mouse to stop translating box";
                } else if (isRotating) {
                    reminder_text = "Release mouse to stop rotating box";
                } else if (mouseDown) {
                    reminder_text = "Release mouse to stop drawing box";
                } else {
                    reminder_text = "Click on point cloud to start drawing bounding box"
                }
            }
        }
    } else {
        reminder_text = "Resume recording to continue annotating";
    }
    
    $("#draw_bounding_box_reminder").find("p").text(reminder_text);
    // console.log(reminder_text);

    
    var x = pos.z;
    var y = pos.x;

    $("#footer").find("p").html("x: {0}{1}y: {2}".format(x.toFixed(3), 
                                                        "<br />", 
                                                        y.toFixed(3)));
}



function generatePointCloud() {
    if (app.cur_pointcloud != null) {
        return updatePointCloud(app.cur_frame.data, COLOR_RED);
    } else {
       return generateNewPointCloud(app.cur_frame.data, COLOR_RED);
    }
}


function switchMoveMode() {
    eventFire(document.getElementById('move'), 'click');
}

function switch2DMode() {
    eventFire(document.getElementById('move2D'), 'click');
}

function moveMode( event ) {
    event.preventDefault();
    // assertRecordMode();
    if (isRecording) {
        controls.enabled = true;
        app.move2D = false;
        document.getElementById( 'move2D' ).className = "";
        document.getElementById( 'move' ).className = "selected";
        controls.maxPolarAngle = 2 * Math.PI;
        controls.minPolarAngle = -2 * Math.PI;
        app.resume_3D_time();
    }
    unprojectFromXZ();
}

// function assertRecordMode() {
//     if (!isRecording) {
//         alert("Resume recording to change modes");
//     }
// }
// function select2DMode() {
//     console.log("draw");
//     document.getElementById( 'move' ).className = "";
//     document.getElementById( 'move2D' ).className = "selected";
//     camera.position.set(0, 100, 0);
//     camera.lookAt(new THREE.Vector3(0,0,0));
//     // camera.rotation.y = 0;
//     controls.maxPolarAngle = 0;
//     controls.minPolarAngle = 0;
//     camera.updateProjectionMatrix();
//     projectOntoXZ();

//     controls.reset();
//     controls.enabled = true;
//     controls.update();
//     app.move2D = true;
// }

function move2DMode( event ) {
    event.preventDefault();
    if (isRecording) {
        document.getElementById( 'move' ).className = "";
        document.getElementById( 'move2D' ).className = "selected";
        if (!app.move2D) {
            controls.maxPolarAngle = 0;
            controls.minPolarAngle = 0;
            camera.updateProjectionMatrix();
            projectOntoXZ();
            // controls.reset();

            app.pause_3D_time();
        }
        controls.enabled = true;
        controls.update();
        app.move2D = true;
    }
    
}

function projectOntoXZ() {
    var count = 0;
    var colors = app.cur_pointcloud.geometry.colors;
    for (var i = 0; i < app.cur_pointcloud.geometry.vertices.length; i++) {
        var v = app.cur_pointcloud.geometry.vertices[i];
        if (colors[i].b > colors[i].r) {
            count += 1;
            v.y = -0.001;
        } else {
            v.y = 0;
        }
    }
    app.cur_pointcloud.geometry.verticesNeedUpdate = true;
}

function unprojectFromXZ() {
    if (app.cur_frame) {
        console.log("unproject");
        for (var i = 0; i < app.cur_pointcloud.geometry.vertices.length; i++) {
            var v = app.cur_pointcloud.geometry.vertices[i];
            v.y = app.cur_frame.ys[i];
        }
        app.cur_pointcloud.geometry.verticesNeedUpdate = true;
    } 
}


function reset() {
    var boundingBoxes = app.cur_frame.bounding_boxes;
    if (boundingBoxes) {
        for (var i = 0; i < boundingBoxes.length; i++) {
            box = boundingBoxes[i];
            scene.remove(box.boxHelper);
            scene.remove(box.points);
            clearTable();
        }
        boundingBoxes = [];
        yCoords = null;
        yCoords = [];
    }
}


