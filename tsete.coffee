container = require('./index.coffee').container()

class Teste
  a: null
  constructor: (a)->
    @a = a
  doSomething: ->
    console.log @a
    
container.register 'a', 'aver'
container.registerClass 'Teste', Teste

container.resolve (teste)->
  teste.doSomething()