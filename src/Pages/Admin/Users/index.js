import React, { Component } from 'react';
import Header from '../../../Components/System/Header';
import {
  ContainerWindowTitle,
  SubTitulo,
  Linha,
  LinhaRodape,
  DivRodape,
  Container,
  DivDetalhe,
} from './styles';
import api from '../../../services/api';
import { alerta } from '../../../services/funcoes';
import { getFromStorage } from '../../../services/auth';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import { Icon, Button } from 'react-materialize';
import { tratarErros } from '../../../services/funcoes';
import Dialog from '../../../Components/Globals/Question';
import './forced.css';

export default class Users extends Component {
  state = {
    loading: false,
    listaUsuarios: [],
    usuarioSelecionado: {},
    listaEmpresas: [],
  };
  /*INICIALIZACAO TELA*/
  async componentDidMount() {
    this.setState({ loading: true });
    this.carregarListaEmpresasAdicionarDirect();
    await this.carregarVariaveisEstado();
    await this.carregarListaUsuarios();
    await this.carregarEmpresas();
    this.setState({ loading: false });
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  carregarEmpresas = async (email) => {
    try {
      const retorno = await api.get('/v1/accounts/empresas');
      if (!retorno) {
        this.setState({ listaEmpresas: [] });
      } else {
        if (retorno.data && retorno.data.sucess) {
          //console.log(retorno.data.data);
          this.setState({ listaEmpresas: retorno.data.data });
        } else {
          this.setState({ listaEmpresas: [] });
        }
      }
    } catch (err) {
      // ////console.log(err);
      alerta('Erro ao carregar as empresas =>' + err);
    }
  };

  carregarListaUsuarios = async () => {
    try {
      let url = `/v1/users`;
      const retorno = await api.get(url);
      if (!retorno) {
        this.setState({ listaUsuarios: [] });
      } else {
        if (retorno.data && retorno.data.sucess) {
          if (retorno.data.data.length === 0) {
            this.setState({ listaUsuarios: [] });
          } else {
            this.setState({
              listaUsuarios: retorno.data.data,
            });
            //console.log(retorno.data.data);
          }
        } else {
          this.setState({ listaUsuarios: [] });
        }
      }
    } catch (err) {
      alerta('Erro ao carregar a lista de book básico =>' + err);
      this.setState({ loading: false });
    }
  };

  carregarListaEmpresasPermitidas = async (usuarioId) => {
    try {
      this.setState({ loading: true });
      let url = `/v1/users/empresas/${usuarioId}`;

      const retorno = await api.get(url);
      if (retorno) {
        if (retorno.data && retorno.data.sucess) {
          const { listaEmpresas } = this.state;
          const empresasPermitidas = retorno.data.data;
          let _listaEmpresas = [];

          listaEmpresas.forEach(async (empresa) => {
            empresa.SELECTED = false;
            empresasPermitidas.forEach(async (permitida) => {
              if (
                empresa.EMP_ID.toString() === permitida.EMPUSR_EMP_ID.toString()
              ) {
                empresa.SELECTED = true;
              }
            });
            _listaEmpresas.push(empresa);
          });

          this.setState({ listaEmpresas: _listaEmpresas });
        }
      }
      this.setState({ loading: false });
    } catch (err) {
      tratarErros('Erro ao carregar a lista de book básico =>' + err);
      this.setState({ loading: false });
    }
  };

  carregarListaEmpresasAdicionarDirect = async () => {
    try {
      this.setState({ loading: true });
      let url = `/v1/users/empresas/direct/adicionar`;

      const retorno = await api.get(url);
      if (retorno) {
        if (retorno.data && retorno.data.sucess) {
          const empresasAdicionar = retorno.data.data;
          const empresasAdicionarListagem = retorno.data.data;
          this.setState({ empresasAdicionar, empresasAdicionarListagem });
        }
      }
      this.setState({ loading: false });
    } catch (err) {
      tratarErros('Erro ao carregar para adicionar =>' + err);
      this.setState({ loading: false });
    }
  };

  encontrarUsuario = async (usuarioId) => {
    const { listaUsuarios } = this.state;
    for (let index = 0; index < listaUsuarios.length; index++) {
      const element = listaUsuarios[index];
      if (element.USR_ID.toString() === usuarioId.toString()) {
        return Object.assign({}, element);
      }
    }
    return undefined;
  };

  handleChangeUsuario = async (e) => {
    const usuario = await this.encontrarUsuario(e.target.value);
    //console.log('usuario');
    //console.log(usuario);
    this.setState({ usuarioSelecionado: usuario });
    if (usuario !== undefined) {
      await this.carregarListaEmpresasPermitidas(usuario.USR_ID);
    } else {
      this.handleLimparEmpresas();
    }
  };

  handleLimparEmpresas = () => {
    let { listaEmpresas } = this.state;
    listaEmpresas.forEach((empresa) => {
      empresa.SELECTED = false;
    });
    this.setState({ listaEmpresas: listaEmpresas });
  };

  handleCheckEmpresa = (e, empresaSelecionada) => {
    var { listaEmpresas, usuarioSelecionado } = this.state;
    if (usuarioSelecionado.USR_ID === undefined) {
      e.target.checked = false;
      alerta(
        'Antes de adicionar as empresas é necessário que você selecione um usuário.',
        1
      );
      return;
    }
    listaEmpresas.forEach((empresa) => {
      if (empresaSelecionada === empresa) {
        empresa.SELECTED = e.target.checked;
      }
    });
    this.setState({
      listaEmpresas: listaEmpresas,
    });
  };

  handleCheckMenu = (e) => {
    var { usuarioSelecionado } = this.state;
    if (usuarioSelecionado.USR_ID === undefined) {
      e.preventDefault();
      alerta(
        'Antes de adicionar permissões é necessário que você selecione um usuário.',
        1
      );
      return;
    }
    usuarioSelecionado.USR_PORTAL_DIRECT_ADM = e.target.checked ? 'V' : 'F';
    this.setState({
      usuarioSelecionado: usuarioSelecionado,
    });
  };

  preparaListaEmpresa = () => {
    const { listaEmpresas } = this.state;

    listaEmpresas.forEach(async (empresa) => {
      empresa.SELECTED = false;
    });

    this.setState({ listaEmpresas: listaEmpresas });
  };

  handleSalvarPermissao = async () => {
    try {
      this.setState({ loading: true });
      const { listaEmpresas, usuarioSelecionado } = this.state;
      let permissao = {};

      permissao.USR_ID = usuarioSelecionado.USR_ID;
      permissao.USR_PORTAL_DIRECT_ADM =
        usuarioSelecionado.USR_PORTAL_DIRECT_ADM;
      permissao.EMPRESAS = [];
      listaEmpresas.forEach(async (empresa) => {
        var _empresa = {};
        _empresa.SELECTED = empresa.SELECTED;
        _empresa.EMPUSR_EMP_ID = empresa.EMP_ID;
        permissao.EMPRESAS.push(_empresa);
      });

      const retorno = await api.put('/v1/users/empresas/permitir', permissao);
      if (retorno.data.sucess) {
        this.preparaListaEmpresa();
        this.setState({ usuarioSelecionado: {} });
        document.getElementById('usuario').value = -1;
        await this.carregarListaUsuarios();
        await this.carregarEmpresas();
      }
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
      tratarErros(
        'Não foi possível salvar as permissões do usuario =>' + error,
        2
      );
    }
  };

  handleCompanySearch = (e) => {
    let { valueCompanySearch, empresasAdicionar, empresasAdicionarListagem } = this.state;
    let pesquisa = valueCompanySearch.toUpperCase();

    if (empresasAdicionar.length !== empresasAdicionarListagem.length) {
      empresasAdicionarListagem = Array.from(empresasAdicionar);
    }

    if (pesquisa !== '') {
      empresasAdicionarListagem = empresasAdicionarListagem.filter(
        (prod) => {
          return prod.EMP_CODIGO.toString().indexOf(pesquisa) !== -1 ||
          prod.EMP_RAZAO_SOCIAL.indexOf(pesquisa) !== -1 ||
          prod.EMP_FANTASIA.indexOf(pesquisa) !== -1
        }
      );
    }

    this.setState({ empresasAdicionarListagem, valueCompanySearch });
    // //console.log(pesquisa);
  };

  handleResetFilters = () => {
    let { empresasAdicionarListagem, empresasAdicionar } = this.state;
    if (empresasAdicionar.length !== empresasAdicionarListagem.length) {
      empresasAdicionarListagem = Array.from(empresasAdicionar);
    }
    this.setState({ empresasAdicionarListagem, valueCompanySearch: '' });
  };

  handleChangeCompanySearch = (e) => {
    let { valueCompanySearch } = this.state;
    valueCompanySearch = e.target.value;
    this.setState({ valueCompanySearch });
  };

  handleRefreshData = async () =>{
    this.carregarListaEmpresasAdicionarDirect();
    await this.carregarVariaveisEstado();
    await this.carregarListaUsuarios();
    await this.carregarEmpresas();
  }

  handleAddEmpresaDirect = async (empresa) => {
    this.setState({ loading: true });
    try {
      let url;
      url = '/v1/users/empresas/direct/adicionar/' + empresa.EMP_ID;
      const retorno = await api.put(url);
      if (retorno.data && retorno.data.sucess) {
          alerta(empresa.EMP_RAZAO_SOCIAL+'\nfoi adicionada ao direct com sucesso!', 1);
          await this.handleRefreshData();
      } else {
        alerta(
          'Não é possível adicionar a empresa selecionada ao Direct.'
        );
      }
    } catch (err) {
      alerta('Não é possível adicionar a empresa selecionada ao Direct =>' + err, 2);
    }
    this.setState({ loading: false });
  };

  render() {
    const {
      loading,
      listaUsuarios,
      usuarioSelecionado,
      listaEmpresas,
      valueCompanySearch,
      empresasAdicionarListagem,
    } = this.state;
    return (
      <>
        <Header />
        <ContainerWindowTitle>
          <DirectTituloJanela
            urlVoltar={'/home'}
            titulo={loading ? 'Carregando...' : 'Permissões usuários'}
          />
        </ContainerWindowTitle>
        <Container>
          <div
            style={{
              display: loading ? 'block' : 'none',
              position: 'absolute',
              height: '100vh',
              width: '100vw',
              top: '0px',
              left: '0px',
              backgroundColor: '#00000069',
              zIndex: '1',
            }}
          ></div>
          <Linha style={{ alignItems: 'center' }}>
            <Dialog
              iconeBotaoPadrao={
                <span
                  title="Adicionar nova empresa"
                  style={{
                    width: '10px!important',
                    display: 'flex',
                  }}
                >
                  &nbsp;<Icon>add</Icon>
                </span>
              }
              classeBotaoPadrao="waves-effect waves-light saib-button is-primary"
              textoBotaoPadrao="Nova empresa"
              titulo=""
              tituloBotaoSim=""
              classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close hidden"
              tituloBotaoNao="Fechar"
              classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
              message={
                <>
                  <div style={{ width: '100%' }}>
                    <label>Pesquise</label>
                    <input
                      value={valueCompanySearch}
                      id="companySearch"
                      onChange={this.handleChangeCompanySearch}
                      onKeyPress={(e) => {
                        let x = e.which || e.keyCode;
                        if (x === 13) {
                          this.handleCompanySearch();
                        }
                      }}
                    />
                    <Button
                      className="waves-effect waves-light saib-button is-primary action-button"
                      onClick={this.handleCompanySearch}
                    >
                      Pesquisa
                    </Button>
                    <Button
                      className="waves-effect waves-light saib-button is-primary action-button"
                      onClick={this.handleResetFilters}
                    >
                      Limpar
                    </Button>
                  </div>
                  <table width="100%">
                    <thead>
                      <th width="15%">Código</th>
                      <th width="84%">Descrição</th>
                    </thead>
                    <tbody style={{textTransform: 'capitalize'}}>
                      {empresasAdicionarListagem !== undefined &&
                        empresasAdicionarListagem.map((emp) => (
                          <tr
                            className="modal-close"
                            onClick={() =>
                              this.handleAddEmpresaDirect(emp)
                            }
                          >
                            <td>{emp.EMP_CODIGO}</td>
                            <td>{emp.EMP_RAZAO_SOCIAL.toLowerCase()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </>
              }
              onNo={() => {}}
              onYes={() => {}}
            />
          </Linha>

          <Linha>
            <DivDetalhe>
              <label for="usuario">Usuários</label>
              <select
                style={{ display: 'flex' }}
                id="usuario"
                onChange={this.handleChangeUsuario}
              >
                <option value="-1">
                  {this.state.loading ? 'Aguarde...' : 'Selecione um usuário'}
                </option>
                {listaUsuarios !== undefined &&
                  listaUsuarios.map((usuario) => (
                    <option key={usuario.USR_ID} value={usuario.USR_ID}>
                      {usuario.USR_NOME}
                    </option>
                  ))}
              </select>
            </DivDetalhe>
          </Linha>
          <Linha>
            <SubTitulo>Acesso às permissões</SubTitulo>
          </Linha>
          <Linha
            style={{
              backgroundColor: 'rgb(247, 247, 247)',
              padding: '10px',
              borderRadius: '10px',
              marginTop: '10px',
              marginRight: '10px',
            }}
          >
            <DivDetalhe style={{ alignItems: 'center', flexDirection: 'row' }}>
              <input
                type="checkbox"
                id="addPermissions"
                checked={
                  usuarioSelecionado.USR_PORTAL_DIRECT_ADM !== undefined &&
                  usuarioSelecionado.USR_PORTAL_DIRECT_ADM === 'V'
                }
                onClick={(e) => this.handleCheckMenu(e)}
              />{' '}
              <label style={{ marginLeft: '5px' }} for="addPermissions">
                {' '}
                Menus{' '}
              </label>
            </DivDetalhe>
          </Linha>
          <SubTitulo>Empresas permitidas</SubTitulo>
          <Linha
            style={{
              backgroundColor: 'rgb(247, 247, 247)',
              padding: '10px',
              borderRadius: '10px',
              marginTop: '10px',
              marginRight: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'stretch',
                flexFlow: 'wrap',
                maxHeight: '400px',
                overflowX: 'auto'
              }}
            >
              {listaEmpresas.map((empresa) => (
                <div style={{display: 'flex', maxWidth: '200px', minWidth: '200px', alignItems: 'flex-start', marginBottom: '10px'}}>
                  <input
                    type="checkbox"
                    id={empresa.EMP_ID}
                    key={empresa.EMP_ID}
                    value={empresa.EMP_ID}
                    checked={empresa.SELECTED}
                    style={{
                      position: 'relative',
                      opacity: '1',
                      marginRight: '10px',
                      pointerEvents: 'all',
                    }}
                    onClick={(e) => this.handleCheckEmpresa(e, empresa)}
                  />
                  <label
                    for={empresa.EMP_ID}
                  >
                    {empresa.EMP_ID + ' - ' + empresa.EMP_NOME}
                  </label>
                </div>
              ))}
            </div>
          </Linha>
          <LinhaRodape>
            <DivRodape>
              <button
                className="waves-effect waves-light saib-button is-primary "
                onClick={() => {
                  this.handleSalvarPermissao();
                }}
              >
                <Icon>save</Icon> Salvar
              </button>
              <button
                className="waves-effect waves-light saib-button is-primary "
                onClick={() => {
                  window.location.href = '/home'; // this.props.history.goBack();
                }}
              >
                <Icon>arrow_back</Icon> Cancelar
              </button>
            </DivRodape>
          </LinhaRodape>
        </Container>
      </>
    );
  }
}
