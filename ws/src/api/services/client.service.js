const mongoose = require('mongoose')
const { createCustomerPagarme }  = require('../../utils/external/pagarme')
const { isEmpty } = require('../../utils/validations')

const ClientRepository      = require('../repositories/client.repository')
const SalonClientRepository = require('../repositories/relationship/salonClient.repository')


/**  **/
const get = async ( query={}, fields='' )=>{    
    console.log('ClientService::post Pagar.me', query, fields )
    return ClientRepository.find(query, fields)
}

/** AULA **
 * @Info USO DO POPULATE() NA CONSULTA noSQL.
 * @param {*} salonId 
 * @param {*} fields 
 * @returns 
 */
const getSalonClients = async ( salonId, fields='clientId status dateRegistration' )=>{    
    console.log('ClientService::getSalonClients', salonId, fields )
    
    //BUSCAR RELACIONAMETO:
    const { salonClients } = await SalonClientRepository.find(
        { salonId, status:{$ne:'e'} },//query
        fields, 
        { path:'clientId', select:'-passwd -customertId' }//populate
    )
    // console.log('ClientService::salonClients', salonClients.clientId, salonClients )
    if( isEmpty(salonClients) ){ return {error:true, message:'Salão sem cliente(s).', clients:[] } }

    // FORMATAR CLIENTES
    const formattedClients = salonClients.map((salCli) =>{ 
        return salCli.clientId.map(cli=>({
            // ...cli._doc,
            id: cli._id,
            name: cli.name,
			phone: cli.phone,
			email: cli.email,
			passwd: cli.passwd,
			photo: cli.photo,
			dateBirth: cli.dateBirth,
			sex: cli.sex,
			status: cli.status,
			customerId: cli.customerId,
			dateRegistration: cli.dateRegistration,
            document: cli.document,
            address: cli.address,
			geo: cli.geo,
            salonClient:{
                salonClientId: salCli._id,
                status: salCli.status,
                clidateRegistration: salCli.dateRegistration
            }
        }))
    }).flat()

    return {  error:false,  message:'Cliente(s) encontrado.',  clients:formattedClients }
}

/*** AULA API Pagar.me ***
 * 
 * @param {*} salonId 
 * @param {*} clientCandidate 
 * @returns 
 */
const post = async ( salonId, clientCandidate )=>{    
    console.log('ClientService::post Pagar.me', salonId, clientCandidate )
    const db = mongoose.connection
    const session = await db.startSession()
    session.startTransaction()

    //BUSCAR CLIENTE:
    const { oldClient } = await ClientRepository.findOne({
        $or:[ 
            { email: clientCandidate.email },
            { phone: clientCandidate.phone }
        ]
    })
    if( oldClient ){ return{ error:true, message:'Clinte já cadastrado.' } }
    
    //CRIAR CUSTOMER Pagar.me:
    const _id = mongoose.Types.ObjectId()
    const pagarmeCustomer = await createCustomerPagarme(_id, clientCandidate)
    // if( pagarmeCustomer.error ){ return{ error:true, message:'Erro, cliente no Pagar.me.', pagarmeCustomer }}

    //NOVO CLIENTE:
    const { newClient } = await ClientRepository.save({
        _id,
        ...clientCandidate,
        customerId: pagarmeCustomer.id || '0'
    })
    if( !newClient ){ return{ error:true, message:'Erro ao criar o cliente.' }}
    
    //BUSCAR RELACIONAMENTO NO DB:
    // const { oldSalonClient } = await SalonClientRepository.findById(clientCandidate.id)
    // const { oldSalonClient } = await SalonClientRepository.findOne({
    //     salonId,
    //     clientId: _id,
    //     status:{ $ne: 'e'}
    // })
    // if( oldSalonClient ){ return{ error:true, message:'Erro, já existe o cliente para este salão.' }}

    //CRIAR RELACIONAMENTO: 
    const { newSalonClient } = await SalonClientRepository.save({
        salonId,
        clientId: newClient.id,
    })

    await session.commitTransaction()
    session.endSession()

    return { error:false, message:'Cliente cadastrado no salão com sucesso.', client:newClient }
}

/*** ***
 * 
 * @param {*} clientId 
 * @param {*} status 
 * @param {*} salonId
 * @param {*} services 
 * @returns 
 */
const put = async ( clientId, status, salColId , services )=>{
    console.log('ClientService::put', clientId, status, salColId, services)
    const db = mongoose.connection
    const session = await db.startSession()
    session.startTransaction()

    //BUSCAR CLIENTE:
    const { oldClient } = await ClientRepository.findOne({_id: clientId})
    if( !oldClient ){ return{ error:true, message:'Cliente não existe.' } }
    
    //ATUALIZA RELACIONAMENTO: (UPDATE STATUS)
    const { upSalonClient } = await SalonClientRepository.findByIdAndUpdate(salColId, { status })
    // if( !upSalonClient ){ return{ error:true, message:'Cliente não tem serviços neste salão.' } }

    //DELETAR RELACIONAMENTO: (DEL SERVICES)
    const { delSalonClients } = await SalonClientRepository.deleteMany({clientId})
    console.log('delSalonClients', delSalonClients)

    //INSERIR RELACIONAMENTO: (INSERT SERVICES) 
    const clientServices      = services.map((serviceId)=>({ serviceId, clientId }))
    const { newSalonClients } = await SalonClientRepository.insertMany(clientServices)
    if( !newSalonClients ){ return{ error:true, message:'Serviços do clientes não inseridos neste salão.' } }

    await session.commitTransaction()
    session.endSession()

    return { error: true, message: 'Serviços do cliente atualizados com sucesso.', services: newSalonClients }
}

/** AULA **/
const deleteById = async (id) => {
    console.log('ClientService::deleteById', id)
    //BUSCAR RELACIONAMENTO:
    const { upSalonClient } = await SalonClientRepository.findByIdAndUpdate(id, {status:'e'})
    if( !upSalonClient ){ return { error: true, message: 'Erro ao deletar.' } }
    
    return { error: false, message: 'Deletado com sucesso.' }
}

const filters = async (query={}, filters={}) => {
    console.log('ClientService::filters',query, filters)
    return ClientRepository.find(query, filters)
}

module.exports = {

    get,
    // getById,
    getSalonClients,
    post,
    put,
    deleteById,
    filters,

}