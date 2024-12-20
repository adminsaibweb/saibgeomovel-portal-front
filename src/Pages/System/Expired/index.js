import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  LateralEsquerda,
  LateralDireita,
  Form,
  LoginForm,
} from './styles';
import logo from '../../../assets/images/saibGeoLogoLogin.png';
import { Icon } from 'react-materialize';
import { logOut } from '../../../services/auth';

class Expired extends Component {
  state = {
    error: '',
    email: '',
    senha: '',
    loading: false,
    mostrarEmpresas: 'false',
    empresaSelecionada: '',
    empresas: [],
    faseLogin: 1,
    nomeUsuario: '',
  };

  async componentDidMount() {
    logOut();
  }

  render() {
    return (
      <Container>
        <LateralEsquerda>
          <img
            src={logo}
            alt="Logo SaibDirect"
            width={'70%'}
          />
        </LateralEsquerda>
        <LateralDireita>
          <LoginForm>
            <Form onSubmit={this.handleSubmit}>
              <Icon large>access_time</Icon>
              <h6> Sua sessão expirou! </h6>
              <br />
              <Link to={'/login'}>
                <span>Entre novamente</span>
              </Link>
            </Form>
          </LoginForm>
        </LateralDireita>
      </Container>
    );
  }
}

export default Expired;
