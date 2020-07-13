const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")
const passport = require("passport")

//incluindo model Usuario
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

router.get("/registro", (req, res) => {    
    res.render( "usuarios/registro")
   // console.log( 'iniciando validacao ')
})

router.post('/registro', (req, res) => {  
    var erros =[]
    console.log( 'iniciando validacao ')
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido!"})
    }  
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "E-mail inválido!"})
    }  
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida!"})
    }  
    
    if (req.body.senha.length < 4) {
        erros.push({ Message: "Senha muito curta!" });
    }
    if (req.body.senha !=  req.body.senha2){
        erros.push({texto: "As senhas são diferentes, tente novamente!"})
    }  



    if(erros.length > 0){
        erros.push({texto: "ERROS!"})
        res.render( "usuarios/registro", {erros: erros})
    }else{
        //na proxima aula
        Usuario.findOne({_email: req.body.email}).lean().then((usuario) => {
            if (usuario){
                req.flash("error_msg", "Já existe uma conta com este e-mail no nosso sistema")
                res.redirect("/usuarios/registro")

            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    eAdmin: 1
                })    

                bcrypt.genSalt(10,(erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro,hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                            res.redirect( "/")
                            
                         }else{
                            novoUsuario.senha = hash
                            novoUsuario.save().then(() =>{
                               req.flash("success_msg", "Usuário criado com sucesso!")
                               res.redirect("/")
                            }).catch((err ) => {
                                req.flash("error_msg", "Houve um erro ao criar o usuario, tente novamente!")
                                res.redirect("/usuarios/registro")
                            })     
                    }
                })
            })
        }
        }).catch((err ) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })      
            
    }
    //console.log("Erro: " , erros)
}) 

router.get("/login", (req,res) => {
    res.render("usuarios/login")
})


router.post("/login", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)


})


router.get("/logout", (req, res) => {
    req.logout()
    req.flash('success_msg', "Deslogando com sucesso!")
    res.redirect("/")
})


module.exports = router