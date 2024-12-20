import React, { Component } from 'react';
import { getMenuToStorage, saveMenuToStorage, getFromStorage } from '../../../services/auth';
import { connect } from 'react-redux';
import Saibmenu from '../SaibMenu';
import { EnviromentVars } from '../../../config/env';
import api from '../../../services/api';
import { alerta } from '../../../services/funcoes';
class Header extends Component {
  state = {
    carregando: 0,
    empresaAtiva: 0,
  };

  async componentDidMount() {
    /* https://github.com/facebook/react/issues/17355  - bug firefox x react */
    setTimeout(() => {
      this.carregarVariaveisEstado();
    }, 100);
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = await getFromStorage();

    if (sessao !== undefined) {
      this.setState({
        empresaAtiva: sessao.empresaId,
        usuarioAtivo: sessao.codigoUsuario,
      });
      await this.carregarMenusModulo();
    } else {
      alerta('Erro ao carregar as variáveis de ambiente. Habilite os cookies no seu navegador!');
      window.location.href = EnviromentVars.urlDirectFront + '/login';
    }
  };

  carregarMenusModulo = async (e) => {
    let menus = getMenuToStorage();
    if (menus === undefined || menus.length === 0) {
      // //console.log('carregando salvos...');
      const { empresaAtiva, usuarioAtivo } = this.state;
      try {
        const retorno = await api.get(`/v1/menus/usuario/${empresaAtiva}/${usuarioAtivo}`);

        if (!retorno) {
          this.setState({ menus: [] });
        } else {
          if (retorno.data && retorno.data.sucess && retorno.data.data.length > 0) {
            this.setState({ menus: retorno.data.data });
            saveMenuToStorage(retorno.data.data);
          } else {
            const res = await api.get('/v1/menus/' + empresaAtiva);
            if (!res) {
              this.setState({ menus: [] });
            } else if (res.data && res.data.sucess) {
              this.setState({ menus: res.data.data });
              saveMenuToStorage(res.data.data);
            }
          }
        }
      } catch (err) {
        alerta('Erro ao carregar os Menus =>' + err);
      }
    } else {
      // //console.log('menus salvos...');
      this.setState({ menus: menus });
    }
  };

  render() {
    // //console.log(this.props);
    const { menus } = this.state;
    return (
      <>
        {menus !== undefined && (
          <>
            {menus.length > 0 ? (
              <Saibmenu
                urlExit={EnviromentVars.urlSaibGeoMovelFront + '/expired'}
                urlHome={EnviromentVars.urlSaibGeoMovelFront + '/home'}
                paths={menus !== [] ? menus : <></>}
                moduleName="Home"
                appName="Saib Direct"
                session={this.props.sessao}
              />
            ) : (
              <>
                {alerta('Usuário sem permissão para acessar o SaibGeo Móvel.', 1)}
                {setTimeout(() => {
                  window.location = '/login';
                }, 1000)}
              </>
            )}
          </>
        )}
      </>
    );
  }
}

function initSession(state) {
  if (!state || !state.token) {
    return { sessao: getFromStorage() };
  } else {
    return state.sessao;
  }
}

export default connect(initSession)(Header);
