import React, { useEffect, useState } from 'react';
import Header from '../../../Components/System/Header';
import {
  SubTitulo,
  Linha,
  LinhaRodape,
  DivRodape,
  Container,
  DivDetalhe,
  MenuItem,
  DivSelect,
  DivMenus,
} from './styles';
import Select from 'react-select';
import { MdCancel } from 'react-icons/md';
import { AiFillSave } from 'react-icons/ai';
import api from '../../../services/api';
import { getFromStorage } from '../../../services/auth';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import { Checkbox, Tab, Tabs } from 'react-materialize';
import { alerta, haveData, tratarErros } from '../../../services/funcoes';
import { colourStyles } from '../../System/Login';

export default function UsersMenu() {
  // const [tabCurrent, setTabCurrent] = useState(1);
  const [typeUser, setTypeUser] = useState('');
  const [hasAccessTradeMarketing, setHasAccessTradeMarketing] = useState('1');
  const [hasAccessAllSchedule, setHasAccessAllSchedule] = useState('1');
  const [loading, setLoading] = useState(false);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [optionsUsers, setOptionsUsers] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState({});
  const [listaMenus, setListaMenus] = useState([]);
  const [listaMenusOrigin, setListaMenusOrigin] = useState([]);
  const [companysHolding, setCompanysHolding] = useState([]);
  const [userData, setUserData] = useState(null);
  const [activePage, setActivePAge] = useState(0);
  const [renderer, setRenderer] = useState(false);

  /*INICIALIZACAO TELA*/
  useEffect(() => {
    setLoading(true);
    async function loadData() {
      const res = await carregarVariaveisEstado();
      await carregarListaUsuarios(res);
      await carregarListaMenus();
    }
    setLoading(false);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    setUserData({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      gupFlagAgenda: sessao.gupFlagAgenda,
    });
    return {
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      gupFlagAgenda: sessao.gupFlagAgenda,
    };
  };

  const carregarListaMenus = async () => {
    try {
      const retorno = await api.get('/v1/menus/lista/' + userData?.empresaAtiva);
      if (!retorno) {
        return;
      } else {
        if (retorno.data && retorno.data.sucess) {
          let listaMenus = retorno.data.data;
          listaMenus.forEach((menu) => {
            menu.SELECTED = false;
          });

          const _listaMenus = parseMenus(listaMenus);
          setListaMenus(_listaMenus);
          setListaMenusOrigin(listaMenus);
        }
      }
    } catch (err) {
      alerta('Erro ao carregar as empresas =>' + err);
    }
  };

  const carregarListaUsuarios = async (user) => {
    try {
      setLoading(true);
      const empresaAtiva = user ? user.empresaAtiva : userData.empresaAtiva;
      const usuarioAtivo = user ? user.usuarioAtivo : userData.usuarioAtivo;
      const flagAgenda = user ? user.gupFlagAgenda : userData.gupFlagAgenda;
      let url = `/v1/users/${empresaAtiva}`;
      const retorno = await api.get(url);
      if (!retorno) {
        return;
      } else {
        if (retorno.data && retorno.data.sucess) {
          if (retorno.data.data.length === 0) {
            return;
          } else {
            const optionsUsers = retorno.data.data.map((usuario) => {
              return {
                value: usuario.USR_ID,
                label: usuario.USR_NOME,
              };
            });
            setListaUsuarios(retorno.data.data);
            const usersList =
              flagAgenda === 1 ? optionsUsers.filter((opt) => opt.value === usuarioAtivo) : optionsUsers;
            setOptionsUsers(usersList);
          }
        }
      }
    } catch (err) {
      alerta('Erro ao carregar a lista de book básico =>' + err);
    } finally {
      setLoading(false);
    }
  };

  const carregarListaMenusPermitidos = async (usuarioId) => {
    try {
      setLoading(true);
      let url = `/v1/menus/usuario/${userData?.empresaAtiva}/${usuarioId}`;

      const retorno = await api.get(url);
      if (retorno) {
        if (retorno.data && retorno.data.sucess) {
          const menusPermitidos = retorno.data.data;
          let _listaMenus = [];

          listaMenusOrigin.forEach(async (menu) => {
            menu.SELECTED = false;
            menusPermitidos.forEach(async (permitido) => {
              if (menu.GME_ID.toString() === permitido.GME_ID.toString()) {
                menu.SELECTED = true;
              }
            });
            _listaMenus.push(menu);
          });
          const result = parseMenus(_listaMenus);
          setListaMenus(result);
        }
      }
      setLoading(false);
    } catch (err) {
      tratarErros('Erro ao carregar a lista de book básico =>' + err);
      setLoading(false);
    }
  };

  async function loadCompanysHolding(user) {
    try {
      setLoading(true);

      const res = await api.get(`v1/users/trade/companys/${userData?.empresaAtiva}/${user}`);

      const { data } = res.data;

      if (data) {
        setCompanysHolding(data);
        return data;
      }
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanysHoldingUser(user, companys) {
    try {
      setLoading(true);

      const res = await api.get(`v1/users/trade/companys/permissions/${userData?.empresaAtiva}/${user}`);

      const { data } = res.data;

      if (data) {
        const parser = companys.map((item) => {
          const exist = data.find((e) => e.EUES_EMP_ID === item.EMP_ID);
          if (exist) {
            item.SELECTED = true;
          } else {
            item.SELECTED = false;
          }

          return item;
        });

        setCompanysHolding(parser);
      }
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  }

  const encontrarUsuario = (usuarioId) => {
    setTypeUser('');

    let usuarioSelecionado_ = {};
    for (let index = 0; index < listaUsuarios.length; index++) {
      const element = listaUsuarios[index];
      if (element.USR_ID.toString() === usuarioId.toString()) {
        usuarioSelecionado_ = element; //Object.assign({}, usuarioSelecionado);

        if (usuarioSelecionado_.USR_GMOVEL_TRADE === 'V') {
          setHasAccessTradeMarketing('0');
          if (usuarioSelecionado_.USR_GMOVEL_SUPERVISOR === 'V') {
            setTypeUser('0');
          } else if (usuarioSelecionado_.USR_GMOVEL_PROMOTOR === 'V') {
            setTypeUser('1');
          } else if (usuarioSelecionado_.USR_GMOVEL_GERENTE === 'V') {
            setTypeUser('2');
          }
        } else {
          setHasAccessTradeMarketing('1');
        }
      }
    }
    setHasAccessAllSchedule(String(usuarioSelecionado_.GUP_FLG_AGENDA));
    setUsuarioSelecionado(usuarioSelecionado_);
  };

  const doChangeUsuario = async (usuarioId) => {
    encontrarUsuario(usuarioId);
    carregarListaMenusPermitidos(usuarioId);
    const res = await loadCompanysHolding(usuarioId);
    await loadCompanysHoldingUser(usuarioId, res);
  };

  const preparaListaSubMenus = (menuId, checked = false) => {
    let _listaMenus = listaMenusOrigin;
    if (listaMenusOrigin !== undefined) {
      _listaMenus = listaMenusOrigin.map((menu) => {
        if (menu.GME_GME_ID === menuId) {
          menu.SELECTED = checked;
        }
        if (menu.GME_ID === menuId) {
          menu.SELECTED = checked;
        }
        return menu;
      });
    }
    const result = parseMenus(_listaMenus);
    setListaMenus(result);
  };

  const handleSalvarPermissao = async () => {
    try {
      setLoading(true);
      if (usuarioSelecionado.USR_ID === undefined) {
        alerta('Antes selecione um usuário!', 1);
        setLoading(false);
        return;
      }

      let permissao = [];
      listaMenusOrigin.forEach(async (menu) => {
        if (menu.SELECTED === true) {
          var _menu = {};
          _menu.GME_ID = menu.GME_ID;
          permissao.push(_menu);
        }
      });

      await handleSaveCompanysHolding()

      const retorno = await api.post(
        '/v1/menus/adicionar/' + userData.empresaAtiva + '/' + usuarioSelecionado.USR_ID,
        permissao
      );

      if (retorno.data.sucess) {
        const permissions = {
          PERMISSOES: {
            GUP_FLG_AGENDA: Number(hasAccessAllSchedule),
          },
        };

        if (hasAccessTradeMarketing === '0') {
          let data = {};
          let flag = true;
          if (typeUser !== '') {
            data = {
              USR_GMOVEL_TRADE: 'V',
              USR_GMOVEL_SUPERVISOR: typeUser === '0' ? 'V' : 'F',
              USR_GMOVEL_PROMOTOR: typeUser === '1' ? 'V' : 'F',
              USR_GMOVEL_GERENTE: typeUser === '2' ? 'V' : 'F',
            };
            const payloadTeams = {
              GET_ID: '',
              GET_COD_GERENTE: '',
              GET_DESCR_GERENTE: '',
              GET_COD_SUPERVISOR: '',
              GET_DESCR_SUPERVISOR: '',
              GET_COD_PROMOTOR: '',
              GET_DESCR_PROMOTOR: '',
              GET_FLG_SITUACAO: '',
            };

            const sessao = getFromStorage();

            const empresaAtiva = sessao.empresaId;
            const usuarioAtivo = sessao.codigoUsuario;
            const resTeams = await api.post(`/v1/tradeteam/${empresaAtiva}/${usuarioAtivo}`, payloadTeams);

            const dataTeams = resTeams.data.data;

            if (haveData(dataTeams)) {
              dataTeams.forEach((ele) => {
                if (Number(usuarioSelecionado.USR_ID) === Number(ele.GET_COD_SUPERVISOR)) {
                  if (typeUser === '0') {
                    flag = true;
                  } else {
                    flag = false;
                  }
                }
                const exist = ele.PROMOTORES.find(
                  (e) => Number(e.GEP_COD_PROMOTOR) === Number(usuarioSelecionado.USR_ID)
                );
                if (exist) {
                  if (typeUser === '1') {
                    flag = true;
                  } else {
                    flag = false;
                  }
                }

                if (Number(usuarioSelecionado.USR_ID) === Number(ele.GET_COD_GERENTE)) {
                  if (typeUser === '2') {
                    flag = true;
                  } else {
                    flag = false;
                  }
                }
              });
            }
          } else {
            flag = true;
            data = {
              USR_GMOVEL_TRADE: 'V',
              USR_GMOVEL_PROMOTOR: 'F',
              USR_GMOVEL_SUPERVISOR: 'F',
              USR_GMOVEL_GERENTE: 'F',
            };
          }

          if (!flag) {
            alerta('O usuário possui outro cargo cadastrado em uma equipe', 2);
            return;
          }

          await api.put(`v1/users/trade/${userData.empresaAtiva}/${usuarioSelecionado.USR_ID}`, {
            ...data,
            ...permissions,
          });
        } else {
          const data = {
            USR_GMOVEL_TRADE: 'F',
            USR_GMOVEL_SUPERVISOR: 'F',
            USR_GMOVEL_PROMOTOR: 'F',
            USR_GMOVEL_GERENTE: 'F',
          };
          await api.put(`v1/users/trade/${userData.empresaAtiva}/${usuarioSelecionado.USR_ID}`, {
            ...data,
            ...permissions,
          });
        }

        alerta('Permissões salvas com sucesso!', 1);
        await carregarListaUsuarios();
      } else {
        alerta('Não foi possível salvar as permissões do usuário. \n' + retorno.data.message, 1);
      }
    } catch (error) {
      console.log(error);
      tratarErros('Não foi possível salvar as permissões do usuario =>' + error, 2);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanysHolding = async () => {
    try {
      const payloadCompanysPermisson = {
        empresas: companysHolding
          .filter((e) => e.SELECTED)
          .map((item) => {
            return item.EMP_ID;
          }),
      };

      await api.put(
        `v1/users/trade/companys/permissions/${userData.empresaAtiva}/${usuarioSelecionado.USR_ID}`,
        payloadCompanysPermisson
      );
    } catch (error) {
      //
    }
  }

  const onChangeTipoUser = (ev) => {
    const typeUser_ = ev.target.value;

    if (ev.target.checked) {
      setTypeUser(typeUser_);
    } else {
      setTypeUser('');
    }
  };

  const onChangeHaveAcessTradeMarketing = (ev) => {
    const _hasAccessTradeMarketing = ev.target.value;
    if (ev.target.checked) {
      setHasAccessTradeMarketing(_hasAccessTradeMarketing);
    } else if (hasAccessTradeMarketing === '0') {
      setHasAccessTradeMarketing('1');
    } else {
      setHasAccessTradeMarketing('0');
    }
  };

  const onChangeHaveAcessAllSchedules = (ev) => {
    const _hasAccessAllSchedules = ev.target.value;
    if (ev.target.checked) {
      setHasAccessAllSchedule(String(_hasAccessAllSchedules));
    } else if (hasAccessAllSchedule === '0') {
      setHasAccessAllSchedule('1');
    } else {
      setHasAccessAllSchedule('0');
    }
  };

  const parseMenus = (menus) => {
    const res = [];

    menus.forEach((item) => {
      if (!item.GME_GME_ID) {
        item.ITENS = [];
        res.push(item);
      }
    });

    for (let indexDad = 0; indexDad < res.length; indexDad++) {
      for (let element = 0; element < menus.length; element++) {
        const currentElement = menus[element];
        const current = menus[element].GME_POSICAO.substring(3, 0);
        const currentDad = res[indexDad].GME_POSICAO.substring(3, 0);
        if (current === currentDad && currentElement.GME_ID !== res[indexDad].GME_ID) {
          res[indexDad].ITENS.push(currentElement);
        }
      }
    }

    return res;
  };

  function subMenu(menu) {
    return (
      <div style={{ paddingLeft: '20px' }}>
        {menu?.ITENS?.map((sub) => (
          <MenuItem key={sub.GME_ID}>
            <div className="line-Menu">
              <input
                type="checkbox"
                id={'checkbox_' + sub.GME_ID}
                style={{
                  marginRight: '5px',
                }}
                readOnly
                checked={sub.SELECTED}
                onClick={(e) => {
                  sub.SELECTED = e !== undefined && e.target.checked ? true : false;
                  preparaListaSubMenus(sub.GME_ID, sub.SELECTED);
                }}
              />{' '}
              {sub.GME_IMAGE && (
                <>
                  <img src={sub.GME_IMAGE} alt="Menu" style={{ width: '18px', height: '18px', marginRight: '5px' }} />
                  <p style={{ fontWeight: '500', fontSize: '15px' }}>{sub.GME_DESCRICAO}</p>
                </>
              )}
              {!sub.GME_IMAGE && <p>{sub.GME_DESCRICAO}</p>}
            </div>
            {subMenu(sub)}
          </MenuItem>
        ))}
      </div>
    );
  }

  const handlePagePerTabs = (ev) => {
    const linkOfPageElement = ev.target;
    const page = linkOfPageElement.href.split('')[linkOfPageElement.href.split('').length - 1];
    setActivePAge(Number(page));
  };

  return (
    <>
      <Header />
      <Container>
        <DirectTituloJanela urlVoltar={'/home'} titulo={loading ? 'Carregando...' : 'Permissões usuários'} />
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
        {/* <DivTabs>
            <Tab onClick={() => this.setState({ tabCurrent: 1 })} status={tabCurrent === 1}>
              Dados pessoais
            </Tab>
            <Tab onClick={() => {
              if (usuarioSelecionado === undefined || usuarioSelecionado.USR_ID === undefined) {
                alerta('Selecione um usuário antes.', 2);
                return;
              }
              this.setState({ tabCurrent: 2 })
            }} status={tabCurrent === 2}>
              Permissões
            </Tab>
          </DivTabs> */}
        <Linha>
          <DivSelect style={{ width: '100%' }}>
            <SubTitulo>Usuários</SubTitulo>
            <Select
              placeholder="Selecione o usuário"
              onChange={(e) => {
                doChangeUsuario(e.value);
              }}
              options={optionsUsers}
              styles={colourStyles}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: '#8e44ad',
                },
              })}
            />
          </DivSelect>
        </Linha>

        <Tabs
          scope="tabs"
          className="tabs-content"
          onClick={(ev) => {
            handlePagePerTabs(ev);
          }}
        >
          <Tab
            tabWidth={200}
            className="element"
            active={activePage === 0}
            options={{
              duration: 300,
              onShow: null,
              responsiveThreshold: Infinity,
              swipeable: true,
            }}
            title={'Menus'}
          >
            <Linha
              style={{
                overflowX: 'auto',
                flexDirection: 'row',
                height: 'calc(100% - 280px)',
              }}
            >
              <DivMenus style={{ width: '100%', marginTop: '20px' }}>
                {!!Object.values(usuarioSelecionado).length ? (
                  listaMenus !== undefined &&
                  listaMenus.map((menu) => (
                    <MenuItem key={menu.GME_ID}>
                      <div className="line-Menu">
                        <input
                          type="checkbox"
                          id={'checkbox_' + menu.GME_ID}
                          style={{
                            marginRight: '5px',
                          }}
                          readOnly
                          checked={menu.SELECTED}
                          onClick={(e) => {
                            menu.SELECTED = e !== undefined && e.target.checked ? true : false;
                            preparaListaSubMenus(menu.GME_ID, menu.SELECTED);
                          }}
                        />{' '}
                        {menu.GME_IMAGE && (
                          <img
                            src={menu.GME_IMAGE}
                            alt="Menu"
                            style={{ width: '18px', height: '18px', marginRight: '5px' }}
                          />
                        )}
                        <span style={{ fontWeight: '500', fontSize: '15px' }}>{menu.GME_DESCRICAO}</span>
                      </div>
                      {menu.ITENS.length > 0 && menu.SELECTED && subMenu(menu)}
                    </MenuItem>
                  ))
                ) : (
                  <div style={{ width: '100%' }}>
                    <p
                      style={{
                        width: '100%',
                        margin: '20px 10px',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: 600,
                      }}
                    >
                      {' '}
                      Selecione um Usuário{' '}
                    </p>
                  </div>
                )}
              </DivMenus>
            </Linha>
          </Tab>
          <Tab
            tabWidth={200}
            className="element"
            active={activePage === 0}
            options={{
              duration: 300,
              onShow: null,
              responsiveThreshold: Infinity,
              swipeable: true,
            }}
            title={'Permissões'}
          >
            {!!Object.values(usuarioSelecionado).length ? (
              <>
                <Linha>
                  <DivDetalhe
                    className="tipoUser"
                    style={{ width: '100%', marginTop: '20px', display: 'flex', gap: 4 }}
                  >
                    <div className="tipoUser-form">
                      <label style={{ fontSize: '16px', marginRight: '12px', fontWeight: 500 }}>
                        Possui acesso ao Trade Marketing:
                      </label>
                      <Checkbox
                        id="yes"
                        label="Sim"
                        value="0"
                        checked={hasAccessTradeMarketing === '0'}
                        onChange={onChangeHaveAcessTradeMarketing}
                      />

                      <Checkbox
                        id="no"
                        label="Não"
                        value="1"
                        checked={hasAccessTradeMarketing === '1'}
                        onChange={onChangeHaveAcessTradeMarketing}
                      />
                    </div>

                    {!!Object.values(usuarioSelecionado).length && hasAccessTradeMarketing === '0' && (
                      <>
                        <div className="tipoUser-form">
                          <label style={{ fontSize: '16px', marginRight: '12px', fontWeight: 500 }}>
                            Tipo usuário:
                          </label>
                          <Checkbox
                            id="supervisor"
                            label="Supervisor"
                            value="0"
                            checked={typeUser === '0'}
                            onChange={onChangeTipoUser}
                          />
                          <Checkbox
                            id="promotor"
                            label="Promotor"
                            value="1"
                            checked={typeUser === '1'}
                            onChange={onChangeTipoUser}
                          />
                          <Checkbox
                            id="gerente"
                            label="Gerente"
                            value="2"
                            checked={typeUser === '2'}
                            onChange={onChangeTipoUser}
                          />
                        </div>
                      </>
                    )}
                    {Object.values(usuarioSelecionado).length > 0 && (
                      <div className="allSchedule-form">
                        <label style={{ fontSize: '16px', marginRight: '12px', fontWeight: 500 }}>
                          Possui acesso a agenda global
                        </label>
                        <Checkbox
                          id="sim"
                          label="Sim"
                          value="0"
                          checked={hasAccessAllSchedule === '0'}
                          onChange={onChangeHaveAcessAllSchedules}
                        />

                        <Checkbox
                          id="não"
                          label="Não"
                          value="1"
                          checked={hasAccessAllSchedule === '1'}
                          onChange={onChangeHaveAcessAllSchedules}
                        />
                      </div>
                    )}
                  </DivDetalhe>
                </Linha>
                <DivMenus style={{ width: '100%', marginTop: '20px' }}>
                  <label style={{ fontSize: '16px', marginRight: '12px', fontWeight: 500 }}>
                    Selecione as filiais com acesso
                  </label>
                  {companysHolding.map((comp, index) => (
                    <MenuItem key={comp.EMP_ID}>
                      <div className="line-Menu">
                        <input
                          type="checkbox"
                          id={'checkbox_' + comp.EMP_ID}
                          style={{
                            marginRight: '5px',
                          }}
                          readOnly
                          checked={comp.SELECTED}
                          onClick={(e) => {
                            comp.SELECTED = e !== undefined && e.target.checked ? true : false;
                            companysHolding[index].SELECTED = e !== undefined && e.target.checked ? true : false;
                            const result = companysHolding;
                            setCompanysHolding(result);
                            setRenderer(!renderer);
                          }}
                        />
                        <p style={{ fontWeight: '400', fontSize: '13px' }}>{comp.EMP_FANTASIA}</p>
                      </div>
                    </MenuItem>
                  ))}
                </DivMenus>
              </>
            ) : (
              <div style={{ width: '100%' }}>
                <p
                  style={{
                    width: '100%',
                    margin: '20px 10px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 600,
                  }}
                >
                  {' '}
                  Selecione um Usuário{' '}
                </p>
              </div>
            )}
          </Tab>
        </Tabs>

        <LinhaRodape>
          <DivRodape>
            <button
              style={{ gap: '4px' }}
              className="saib-button is-primary cancell"
              onClick={() => {
                window.location.href = '/home';
              }}
            >
              <MdCancel size={18} color="#fff" /> Cancelar
            </button>
            <button
              style={{ gap: '4px' }}
              className="saib-button is-primary"
              onClick={() => {
                handleSalvarPermissao();
              }}
              disabled={usuarioSelecionado === undefined || usuarioSelecionado.USR_ID === undefined}
            >
              <AiFillSave size={18} color="#fff" /> Salvar
            </button>
          </DivRodape>
        </LinhaRodape>
      </Container>
    </>
  );
}
