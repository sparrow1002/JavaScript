const loadfile = require('./AA3_05784062_LoadFile.json')
const R_MLO_file = require('./AA3_05784062_R_MLO_1.json')
const L_MLO_file = require('./AA3_05784062_L_MLO_1.json')
const R_CC_file = require('./AA3_05784062_R_CC_1.json')
const L_CC_file = require('./AA3_05784062_L_CC_1.json')

function convertCircle(item, R_MLO_file, L_MLO_file, R_CC_file, L_CC_file) {
    if (!item.radius) return

    let annotation = {}
    annotation.image_id = 1

    annotation.category_ids = []
    if (item.layers === 'masses') annotation.category_ids.push(2)
    if (item.layers === 'calcifications') annotation.category_ids.push(3)

    let width = 0, height = 0
    if (R_MLO_file.images[0].width && R_MLO_file.images[0].height) {
        width = R_MLO_file.images[0].width
        height = R_MLO_file.images[0].height
    } else if (L_MLO_file.images[0].width && L_MLO_file.images[0].height) {
        width = L_MLO_file.images[0].width
        height = L_MLO_file.images[0].height
    } else if (R_CC_file.images[0].width && R_CC_file.images[0].height) {
        width = R_CC_file.images[0].width
        height = R_CC_file.images[0].height
    } else if (L_CC_file.images[0].width && L_CC_file.images[0].height) {
        width = L_CC_file.images[0].width
        height = L_CC_file.images[0].height
    } else {
        console.log('width,height mapping error')
        return
    }
    annotation.circle = []
    // 根據width,height判斷X,Y是在四張圖的哪一張
    let circleX = 0, circleY = 0
    let bboxX = 0, bboxY = 0
    let centerX = width / 2, centerY = height / 2
    let circleType = ''
    // R_MLO 左上
    if (item.selectX < centerX && item.selectY < centerY) {
        if (idIsExists(item.id, R_MLO_file)) return
        circleX = Math.floor(item.selectX * 2)
        circleY = Math.floor(item.selectY * 2)
        bboxX = Math.floor(item.bbox.topLeft[0] *2)
        bboxY = Math.floor(item.bbox.topLeft[1] *2)
        circleType = 'R_MLO'
    }
    // L_MLO 右上
    else if (item.selectX > centerX && item.selectY < centerY) {
        if (idIsExists(item.id, L_MLO_file)) return
        circleX = Math.floor((item.selectX - centerX) * 2)
        circleY = Math.floor(item.selectY * 2)
        bboxX = Math.floor((item.bbox.topLeft[0] - centerX) * 2)
        bboxY = Math.floor(item.bbox.topLeft[1] *2)
        circleType = 'L_MLO'
    }
    // R_CC 左下
    else if (item.selectX < centerX && item.selectY > centerY) {
        if (idIsExists(item.id, R_CC_file)) return
        circleX = Math.floor(item.selectX * 2)
        circleY = Math.floor((item.selectY - centerY) * 2)
        bboxX = Math.floor(item.bbox.topLeft[0] *2)
        bboxY = Math.floor((item.bbox.topLeft[1] - centerY) *2)
        circleType = 'R_CC'
    }
    // L_CC右下
    else if (item.selectX > centerX && item.selectY > centerY) {
        if (idIsExists(item.id, L_CC_file)) return
        circleX = Math.floor((item.selectX - centerX) * 2)
        circleY = Math.floor((item.selectY - centerY) * 2)
        bboxX = Math.floor((item.bbox.topLeft[0] - centerX) *2)
        bboxY = Math.floor((item.bbox.topLeft[1] - centerY) *2)
        circleType = 'L_CC'
    } else {
        console.log('x,y mapping error')
        return
    }

    annotation.id = item.id
    annotation.circle.push(circleX)
    annotation.circle.push(circleY)
    annotation.circle.push(Math.floor(item.radius))
    annotation.bbox = []
    annotation.bbox.push(bboxX)
    annotation.bbox.push(bboxY)
    annotation.bbox.push(Math.floor(item.radius * 2))
    annotation.bbox.push(Math.floor(item.radius * 2))
    annotation.malignant = item.malignant
    
    console.log('annotation', annotation)
    
    switch(circleType) {
        case 'R_MLO':
            R_MLO_file.annotations.push(annotation)
          break;
        case 'L_MLO':
            L_MLO_file.annotations.push(annotation)
          break;
        case 'R_CC':
            R_CC_file.annotations.push(annotation)
          break;
        case 'L_CC':
            L_CC_file.annotations.push(annotation)
          break;
        default:
          break;
      }
}

function idIsExists(id, file) {
    if (!file.annotations) { return false }
    let element = file.annotations.find(function(element) {
        return element.id === id;
      })
    return element ? true : false
}

if (loadfile.review.length) {
    loadfile.review.map( item => { convertCircle(item, R_MLO_file, L_MLO_file, R_CC_file, L_CC_file) } )
  }