/**
 * @SERVICE_REPOSITORY
*/

const mongoose      = require('mongoose')

const ServiceModel = require('../models/service.model')
const FileModel    = require('../models/file.model')


/**
 * 
 * @param {*} query 
 * @param {*} fields 
 * @returns 
 */
const find = async ( query={}, fields='' ) => {
    try {
        const services = await ServiceModel.find(query).select(fields)
        return { error:false, services }
    } catch (error) {
        return { error:true, message:error.message, services:[] }
    }
}

/**
 * 
 * @param {*} id 
 * @param {*} fields 
 * @returns 
 */
const findById = async (id, fields='') => {    
    try {
        const service = await ServiceModel.findById({ _id:id }).select(fields)
        return { error:false, service }
    } catch (error) {
        return { error:true, message:error.message }
    }
}

/**
 * 
 * @param {*} id 
 * @param {*} service 
 * @returns 
 */
 const findByIdAndUpdate = async (id, service) => {    
    try {
        const upService = await ServiceModel.findByIdAndUpdate(id, service )
        return { error:false, upService }
    } catch (error) {
        return { error:true, message:error.message, upService:null }
    }
}

/*** AULA ***
 * 
 * @param {*} query
 * @returns 
 */
const save = async (query={}) => {
    try {
        const newService = await ServiceModel(query).save()
        return { error:false, newService }
    } catch (error) {
        return { error:true, message:error.message, newService:null }
    }
}

/**
 * @Info Salva Service e File no DB.
 * @param {*} service Obj{}
 * @param {*} files Obj{}
 * @returns Obj { erro, servicem files }
 */
const saveFull = async (service, files) => {
    console.log('ServiceRepository:: saveFull')
    const db = mongoose.connection
    const session = await db.startSession()
    try {
        session.startTransaction()
        //INSERT SERVICE:
        const savedService = await ServiceModel(service).save()
        if( !savedService ) { return {error:true, service:null, files:null } }

        //INSERT FILE: Criar files[] do service para salvar no db:
        const filesToDB = await files.map(({folderPath, meta})=>{
            return{
                referenceId: savedService._id,
                model: 'Service',
                path: folderPath,
                meta
            }
        })
        const savedFiles = await FileModel.insertMany(filesToDB)
        if( !savedFiles ) { return {error:true, service:null, files:null } }

        await session.commitTransaction()
        session.endSession()
        return { error:false, message:"Serviço salvo com sucesso.", service:savedService, files:savedFiles }
    } catch (error) {
        console.log('ServiceRepository:: saveFull ERROR', error)
        await session.commitTransaction()
        session.endSession()
        return { error:true, message:error, service:null, files:null }
    }
}

/**
 * @Info Atualiza Service e File no DB.
 * @param {*} id 
 * @param {*} salonId 
 * @param {*} service 
 * @param {*} files 
 * @returns 
 */
const updateFull = async (id, service, files) => {
    console.log('ServiceRepository:: updateFull ')
    const db = mongoose.connection
    const session = await db.startSession()
    try {
        session.startTransaction()
        // UPDATE SERVICE:
        const upService = await ServiceModel.findByIdAndUpdate(id, service)        
        if( !upService ){ return { error:true, message:"Erro, serviço inexistente.", service:null, files:null} }

        //DELETE OLD FILES:
        const oldFile = await FileModel.deleteMany({ referenceId:id })
        
        //INSERT FILES: Criar files[] do service para salvar no db:
        const filesToDB = await files.map(({folderPath, meta})=>({
            referenceId: id,
            model: 'Service',
            path: folderPath,
            meta
        }))
        const upFiles = await FileModel.insertMany(filesToDB)

        await session.commitTransaction()
        session.endSession()
        return { error:false, message:"Atualização feita com sucesso.", service:upService, files:upFiles }
    } catch (error) {
        console.log('ServiceRepository:: updateFull ERROR', error)
        await session.commitTransaction()
        session.endSession()
        return { error:true, message:error, service:null, files:null }
    }
}

module.exports = { 

    find,
    findById, //NAO EH DA AULA
    findByIdAndUpdate,
    save,
    saveFull,
    updateFull,

    model:ServiceModel,
}