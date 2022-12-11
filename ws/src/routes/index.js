/**
 * @ROUTES  Este módulo possui todas as rotas da API:
 *          Acrescente novas rotas aqui.
*/

const api           = require('./api.route')
const salon         = require('./salon.route')
const service       = require('./service.route')
const schedule      = require('./schedule.route')
const collaborator  = require('./collaborator.route')
const client        = require('./client.route')
const scheduling    = require('./scheduling.route')

//remover os: OFF
// const serviceOFF        = require('./service.off.route')
// const collaboratorOFF   = require('./collaborator.off.route')

module.exports = [
    
    api,
    salon,
    service,
    schedule,
    collaborator,
    client,
    scheduling,

    //remover os: OFF
    // serviceOFF,
    // collaboratorOFF

]