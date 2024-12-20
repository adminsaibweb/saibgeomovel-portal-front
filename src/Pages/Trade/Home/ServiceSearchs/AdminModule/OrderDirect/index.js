import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Chip, Collapsible, CollapsibleItem, Icon } from 'react-materialize';
import { handleDeleteSale, handleFindProduct, handleGetSales } from '../../../tradeGlobalFunctions';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { getFromStorage } from '../../../../../../services/auth';
import { Labels } from '../../../style';
import { Titulo } from '../style';
import { alerta, formatOracleDateToBr, getScheduleData, updateScheduleData } from '../../../../../../services/funcoes';
import { DialogContent, DialogOptions, ContentCollapsible } from './styled';
import SaibRadioGroup from '../../../../../../Components/Globals/SaibRadioGroup';
import { IoMdEye, IoMdOptions } from 'react-icons/io';
import M from 'materialize-css';

class OrderDirect extends Component {
  state = {
    status: 0,
    loading: false,
    searchProduct: '',
    products: [],
    productsOrder: [],
    typeOperation: 0,
    openDialogOptions: false,
    openFilters: false,
    ufs: [],
    citys: [],
    companys: [],
    productsOrigins: [],
  };

  componentDidMount = async () => {
    const { cliente, pesquisas, order, productsFilter } = this.props.history.location.state;
    await this.carregarVariaveisEstado();
    const scheduleData = await getScheduleData()

    let inProgress = scheduleData.ORDERS_DIRECT;
    if (inProgress) {
      inProgress = scheduleData.ORDERS_DIRECT.INPROGRESS;
    }

    if (order) {
      this.setState({
        productsOrder: order,
      });
    }

    this.setState({
      cliente,
      pesquisas,
      loading: false,
      openDialogOptions: order && order.length > 0 ? false : true,
      inProgress,
      products: productsFilter || []
    });
  };

  handleSearchProduct = async () => {
    const { searchProduct } = this.state;
    if (!searchProduct) {
      alerta('Informe algum produto', 1);
      return;
    }
    this.setState({ loading: true });
    const sessao = getFromStorage();
    let res = await handleFindProduct(sessao.empresaId, sessao.codigoUsuario, searchProduct);
    if (res) {
      const productsOrigins = res

      const ufs = [];
      const citys = [];
      const companys = [];

      res.forEach((item) => {
        const existUf = ufs.find((e) => e === item.UF);
        const existCity = ufs.find((e) => e === item.CIDADE);
        const existCompany = ufs.find((e) => e === item.CODIGO);

        if (!existUf) {
          ufs.push(item);
        }
        if (!existCity) {
          citys.push(item);
        }
        if (!existCompany) {
          companys.push(item);
        }
      });

      let ufsChips = {};

      for (const uf of ufs) {
        let item = `${uf.UF}`;
        ufsChips[item] = null;
      }
      let citysChips = {};

      for (const uf of citys) {
        let item = `${uf.CIDADE}`;
        citysChips[item] = null;
      }
      let companysChips = {};

      for (const uf of companys) {
        let item = `${uf.NOME_FANTASIA}`;
        companysChips[item] = null;
      }

      this.setState({ products: res, productsOrigins, typeScreen: 1, ufsChips, citysChips, companysChips });
    } else {
      alerta('Não foi possível buscar os dados, verifique sua conexão com a internet', 2);
    }
    this.setState({ loading: false });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
    });
  };

  handleAddProduct = async (prod) => {
    const { productsOrder, productsOrigins, empresaAtiva } = this.state;

    const posExist = productsOrder.findIndex(
      (e) => e.PROD_ID === prod.PROD_ID && e.CODIGO === prod.CODIGO && e.SERIE === prod.SERIE
    );

    const productAux = productsOrigins.find(
      (e) => e.CODIGO_INTEGRACAOO === prod.CODIGO_INTEGRACAOO && e.ESIN_EMP_ID === empresaAtiva
    );


    if (!productAux) {
      alerta("O produto não está cadastrado na empresa atual")
      return
    }

    if (posExist !== -1) {
      if (productsOrder[posExist].QTDE_PEDIDO + 1 <= productsOrder[posExist].QTDE_ORIGIN - productsOrder[posExist].QTDE_UTILIZADA) {
        productsOrder[posExist].QTDE_PEDIDO += 1;
        productsOrder[posExist].QTDE -= 1;
        productsOrder[posExist].PROD_ID_VENDA = productAux?.PROD_ID || prod.PROD_ID;
        productsOrder[posExist].ESIN_ID_VENDA = productAux?.ESIN_ID !== -1 ? productAux?.ESIN_ID : null;
        productsOrder[posExist].ESIN_EMP_ID_VENDA = productAux?.ESIN_EMP_ID || prod.ESIN_EMP_ID;
        alerta('Produto adicionado', 1);
      }
    } else {
      prod.QTDE_PEDIDO = 1;
      prod.QTDE_ORIGIN = prod.QTDE;
      prod.QTDE -= 1;
      prod.PROD_ID_VENDA = productAux?.PROD_ID || prod.PROD_ID;
      prod.ESIN_ID_VENDA = productAux?.ESIN_ID !== -1 ? productAux?.ESIN_ID : null;
      prod.ESIN_EMP_ID_VENDA = productAux?.ESIN_EMP_ID || prod.ESIN_EMP_ID;
      productsOrder.push(prod);
      alerta('Produto adicionado', 1);
    }
    this.setState({ productsOrder });
  };

  handleRemoveProduct = (prod) => {
    let { productsOrder } = this.state;

    const pos = productsOrder.findIndex(
      (e) => e.PROD_ID === prod.PROD_ID && e.CLI_ID === prod.CLI_ID && e.SERIE === prod.SERIE
    );

    if (pos !== -1) {
      if (productsOrder[pos].QTDE + 1 <= productsOrder[pos].QTDE_ORIGIN) {
        productsOrder[pos].QTDE_PEDIDO -= 1;
        productsOrder[pos].QTDE += 1;
      }

      if (productsOrder[pos].QTDE_PEDIDO === 0) {
        productsOrder.splice(pos, 1);
      }
    }
    this.setState({ productsOrder });
  };

  handleSendOrder = async (view) => {
    const { cliente, pesquisas, productsOrder, typeOperation, products, productsOrigins } = this.state;

    this.setState({ loading: true });

    const companys = [];
    productsOrder.forEach((item) => {
      const exist = companys.findIndex((e) => e.id === item.CLI_ID);

      if (exist !== -1) {
        companys[exist] = {
          name: item.NOME_FANTASIA,
          emp: item.ESIN_EMP_ID,
          id: item.CLI_ID,
          products: [...(companys[exist].products || []), item],
        };
      } else {
        companys.push({
          name: item.NOME_FANTASIA,
          emp: item.ESIN_EMP_ID,
          id: item.CLI_ID,
          products: [item],
        });
      }
    });

    this.props.history.push({
      pathname: '/NewOrderDirect',
      state: {
        cliente,
        pesquisas,
        companys,
        statusVenda: typeOperation,
        order: productsOrder,
        view,
        productsFilter: products,
        productsOrigins
      },
    });

    this.setState({ loading: false });
  };

  handleTypeOrder = (type) => {
    this.setState({ typeOperation: type, openDialogOptions: false });
  };

  handleEditOrder = async (item, index, view) => {
    const { empresaAtiva, usuarioAtivo, cliente, pesquisas, inProgress } = this.state;
    const scheduleData = await getScheduleData()
    this.setState({ loading: true });
    const res = await handleGetSales(empresaAtiva, usuarioAtivo, item.ATD_ID);
    this.setState({ loading: false });

    if (res && res.length !== 0) {
      this.props.history.push({
        pathname: '/EditOrderDirect',
        state: {
          cliente,
          pesquisas,
          order: res,
          pos: index,
        },
      });
    } else {
      inProgress[index].ATD_FLAG_SITUACAO = 'B';
      scheduleData.ORDERS_DIRECT.INPROGRESS = inProgress;
      await updateScheduleData(scheduleData)
      this.setState({ inProgress });
      alerta('Não é possível editar esse pedido', 2);
      return;
    }
  };

  handleDeleteOrder = async (id, index) => {
    let { empresaAtiva, usuarioAtivo, inProgress } = this.state;
    this.setState({ loading: true });
    const res = await handleDeleteSale(empresaAtiva, usuarioAtivo, id);
    this.setState({ loading: false });

    if (res) {
      inProgress = inProgress.filter((e) => e.ATD_ID !== id);

      this.setState({ inProgress });
      const scheduleData = await getScheduleData()
      scheduleData.ORDERS_DIRECT.INPROGRESS = inProgress;
      await updateScheduleData(scheduleData)
    }
  };

  onChangeSelectCitys = () => {
    if (document.getElementById('cityChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('cityChips'));
      let citysSelects;
      const namesCitys = [];

      if (dados !== undefined) {
        citysSelects = dados.chipsData;
        if (citysSelects && citysSelects?.length > 0) {
          for (let promotor of citysSelects) {
            let name = promotor.tag.split('-')[0].replace(' ', '');
            namesCitys.push(name);
          }
        }

        this.setState({
          citysSelects,
          namesCitys,
        });
      }
    }
  };

  onChangeSelectUf = () => {
    if (document.getElementById('ufsChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('ufsChips'));
      let ufsSelects;
      const namesUfs = [];

      if (dados !== undefined) {
        ufsSelects = dados.chipsData;
        if (ufsSelects && ufsSelects?.length > 0) {
          for (let promotor of ufsSelects) {
            let name = promotor.tag.split('-')[0].replace(' ', '');
            namesUfs.push(name);
          }
        }

        this.setState({
          ufsSelects,
          namesUfs,
        });
      }
    }
  };

  onChangeSelectCompany = () => {
    if (document.getElementById('companysChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('companysChips'));
      let companysSelects;
      let namesCompanys = [];

      if (dados !== undefined) {
        companysSelects = dados.chipsData;
        if (companysSelects && companysSelects?.length > 0) {
          for (let promotor of companysSelects) {
            let name = promotor.tag.split('-')[0].replace(' ', '');
            namesCompanys.push(name);
          }
        }

        this.setState({
          companysSelects,
          namesCompanys,
        });
      }
    }
  };

  removeAcent = (word) => {
    return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  render() {
    const {
      cliente,
      pesquisas,
      loading,
      searchProduct,
      products,
      productsOrder,
      openDialogOptions,
      typeOperation,
      openFilters,
      ufsChips,
      citysChips,
      companysChips,
      citysSelects,
      ufsSelects,
      companysSelects,
      namesCitys,
      namesUfs,
      namesCompanys,
      optionFilterSituation,
    } = this.state;


    let productsFilter = products.filter((e) => e.QTDE - e.QTDE_UTILIZADA > 0);
    if (namesCitys && namesCitys.length > 0) {
      productsFilter = productsFilter.filter((e) => namesCitys.includes(this.removeAcent(e.CIDADE)));
    }
    if (namesUfs && namesUfs.length > 0) {
      productsFilter = productsFilter.filter((e) => namesUfs.includes(this.removeAcent(e.UF)));
    }
    if (namesCompanys && namesCompanys.length > 0) {
      productsFilter = productsFilter.filter((e) => namesCompanys.includes(this.removeAcent(e.NOME_FANTASIA)));
    }

    if (optionFilterSituation === '1') {
      productsFilter = productsFilter.filter((e) => e.LOCALIZACAO === 'EM_ESTOQUE');
    } else if (optionFilterSituation === '2') {
      productsFilter = productsFilter.filter((e) => e.LOCALIZACAO === 'CONSIGNADO');
    }

    return (
      <>
        <WaitScreen loading={loading} />

        <Titulo
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '15px',
            top: '0px',
            zIndex: '2',
          }}
        >
          <button
              style={{ cursor: 'pointer', color: 'white' }}
              className="waves-effect waves-light saib-button is-cancel"
              onClick={() => {
                this.props.history.push({
                  pathname: '/AdminModule',
                  state: {
                    cliente: cliente,
                    pesquisas: pesquisas,
                  },
                });
              }}
            >
              <Icon className="modal-close">arrow_back</Icon>
            </button>
          {typeOperation === 1 && <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Venda direta (venda)</p>}
          {typeOperation === 0 &&<p style={{ position: 'unset', top: 'unset', width: '100%' }}>Venda direta (consignado)</p>}
          {typeOperation === 2 &&<p style={{ position: 'unset', top: 'unset', width: '100%' }}>Venda direta (bonificação)</p>}
        </Titulo>
        <section style={{ width: '100%', padding: '10px 5px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '5px',
              width: '100%',
            }}
          >
            <Button
              onClick={() => this.setState({ openDialogOptions: true })}
              className="waves-effect waves-light saib-button is-primary"
              disabled={openDialogOptions}
            >
              Alterar o tipo de venda
            </Button>
            {products && products.length > 0 && (
              <Button
                onClick={() => this.setState({ openFilters: !openFilters })}
                className="waves-effect waves-light saib-button is-primary"
              >
                <IoMdOptions style={{ marginRight: '0.3rem' }} />
                Filtrar produtos
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5px', width: '100%' }}>
            <Labels>Buscar produto</Labels>
            <input
              type="text"
              value={searchProduct}
              onChange={(event) => this.setState({ searchProduct: event.target.value })}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  this.handleSearchProduct();
                }
              }}
            />
            <Button
              style={{ width: '100%' }}
              onClick={this.handleSearchProduct}
              className="waves-effect waves-light saib-button is-primary"
            >
              <Icon className="modal-close">search</Icon>
              Pesquisar
            </Button>
          </div>

          {productsOrder && productsOrder.length > 0 && (
            <>
              <ContentCollapsible className="collapsibleQuestionManager">
                <Collapsible accordion className="collapsibleQuestionManager">
                  <CollapsibleItem
                    className="collapsibleQuestionManagerItem"
                    expanded={false}
                    icon={
                      <>
                        <p className="material-icons plus">add_circle_outline</p>

                        <p className="material-icons minus">remove_circle_outline</p>
                      </>
                    }
                    header={
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%',
                          padding: '5px',
                          gap: '5px',
                          background: '#bf1f7c',
                          color: '#fff',
                          borderRadius: '5px',
                        }}
                      >
                        <span>{productsOrder.length} produtos no pedido</span>
                      </div>
                    }
                    node="div"
                  >
                    {productsOrder.map((item, index) => (
                      <div
                        key={`${item.PROD_ID}_${item.CODIGO}_${item.LOTE}_${index}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          borderBottom: '1px solid #ccc',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>{item.PRODUTO}</span>
                          <span style={{ fontWeight: '500', fontSize: '1rem', marginTop: "-2px" }}>{item.NOME_FANTASIA}</span>
                          <span style={{ fontWeight: '400', fontSize: '0.9rem', marginTop: "-2px", color: "#4d4d4d" }}>
                            {item.CLI_ID === -1 ? "Venda" : "Devolução"}
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: '500', fontSize: '1.2rem' }}>Qtde: {item.QTDE_PEDIDO}</span>
                        <button
                          onClick={() => this.handleRemoveProduct(item)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#8E44AD',
                            color: '#fff',
                            borderRadius: '4px',
                            border: 'none',
                            marginRight: '0.3rem',
                            padding: '0.2rem',
                          }}
                        >
                          <Icon>remove</Icon>
                        </button>
                        </div>
                      </div>
                    ))}
                  </CollapsibleItem>
                </Collapsible>
              </ContentCollapsible>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  marginTop: '-4px',
                }}
              >
                <Button
                  onClick={() => this.handleSendOrder(true)}
                  style={{
                    gap: '0.3rem',
                    margin: '0.6rem 0.2rem 0.2rem',
                    width: '100%',
                    background: '#bf1f7c',
                  }}
                  className="waves-effect waves-light saib-button is-primary"
                >
                  Visualizar
                  <IoMdEye size={20} />
                </Button>
                <Button
                  onClick={() => this.handleSendOrder(false)}
                  style={{
                    gap: '0.3rem',
                    margin: '0.6rem 0.2rem 0.2rem',
                    width: '100%',
                    background: '#bf1f7c',
                  }}
                  className="waves-effect waves-light saib-button is-primary"
                >
                  Enviar pedido
                  <Icon className="modal-close">send</Icon>
                </Button>
              </div>
            </>
          )}

          {productsFilter.map((prod) => (
            <div
              className="card"
              key={`${prod.PROD_ID}_${prod.CODIGO}_${prod.SERIE}`}
              style={{
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #9545ba',
                boxShadow:
                  'rgba(0, 0, 0, 0.25) 0px 2px 2px, rgba(0, 0, 0, 0.12) 0px 0px 3px, rgba(0, 0, 0, 0.12) 0px 2px 2px, rgba(0, 0, 0, 0.17) 0px 4px 3px, rgba(0, 0, 0, 0.09) 0px 0px 2px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  background: '#8E44AD',
                  borderRadius: '5px 5px 0px 0px',
                  padding: '4px',
                }}
              >
                <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>
                  {prod.NOME_FANTASIA} - {prod.RAZAO_SOCIAL}
                </span>
              </div>
              <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1rem' }}>
                {prod.CODIGO_INTEGRACAOO} - {prod.PRODUTO}
              </p>
              <p style={{ padding: '0 0.2rem', fontSize: '1rem' }}>
                Endereço: {prod.ENDERECO} - {prod.CIDADE} - {prod.UF}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.6rem',
                  padding: '0 0.2rem',
                  fontSize: '1rem',
                }}
              >
                <p>
                  <strong>Lote: </strong>
                  {prod.LOTE}
                </p>
                <p>
                  <strong>Série: </strong>
                  {prod.SERIE}
                </p>
              </div>
              <p style={{ padding: '0 0.2rem', fontSize: '1rem' }}>
                <strong>Qtde:</strong> {prod.QTDE - prod.QTDE_UTILIZADA}
              </p>
              {prod.CONTATO && (
                <p style={{ padding: '0 0.2rem', fontSize: '1rem' }}>
                  <strong>Contato:</strong> {prod.CONTATO}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.6rem',
                  padding: '0 0.2rem',
                  fontSize: '1rem',
                }}
              >
                <p>
                  <strong>Validade: </strong>
                  {formatOracleDateToBr(prod.DATA_VALIDADE)}
                </p>
                <p style={{ color: prod.LOCALIZACAO === 'CONSIGNADO' ? '#ed3241' : '#14532d', fontWeight: '600' }}>
                  {prod.LOCALIZACAO.replaceAll('_', ' ')}
                </p>
              </div>
              <Button
                onClick={() => this.handleAddProduct(prod)}
                style={{
                  gap: '0.3rem',
                  margin: '0.6rem 0.2rem 0.2rem',
                  width: '98%',
                }}
                className="waves-effect waves-light saib-button is-primary"
              >
                Adicionar no pedido
                <Icon className="modal-close">add</Icon>
              </Button>
            </div>
          ))}

          {(!productsFilter || (productsFilter && productsFilter.length === 0)) && (
            <Labels style={{ margin: '0.4rem', fontSize: '1.2rem', color: '#000' }}>Nenhum produto encontrado</Labels>
          )}
        </section>

        {openDialogOptions && (
          <DialogOptions>
            <DialogContent>
              <h2>Escolha a opção de pedido</h2>
              <Button
                onClick={() => this.handleTypeOrder(1)}
                className="waves-effect waves-light saib-button is-primary"
              >
                Venda
              </Button>
              <Button
                onClick={() => this.handleTypeOrder(0)}
                className="waves-effect waves-light saib-button is-primary"
              >
                Consignado
              </Button>
              <Button
                onClick={() => this.handleTypeOrder(2)}
                className="waves-effect waves-light saib-button is-primary"
              >
                Bonificação
              </Button>
            </DialogContent>
          </DialogOptions>
        )}

        {openFilters && (
          <DialogOptions>
            <DialogContent>
              <SaibRadioGroup
                valueItems={'"1","2", "3"'}
                classNameItems={'"estoque", "consignado", "all"'}
                textItems={'"Em estoque","Consignado", "Todos"'}
                idItems={'"estoqueId", "consignadoId", "allId"'}
                classNameRadio="filterSituation"
                flexDirectionRadio="row"
                disabledRadio="false"
                defaultCheckedId={'allId'}
                onChange={async (value) => {
                  this.setState({
                    optionFilterSituation: value,
                  });
                }}
              />
              <div flex={3} className="divDetailGerente">
                <Labels>Cidade</Labels>
                <Chip
                  id="cityChips"
                  className="cityChips"
                  close={false}
                  closeIcon={<Icon className="close">close</Icon>}
                  options={{
                    data: citysSelects !== undefined ? citysSelects : [],
                    onChipAdd: this.onChangeSelectCitys,
                    onChipDelete: this.onChangeSelectCitys,
                    autocompleteOptions: {
                      data: citysChips,
                      limit: 1,
                      onAutocomplete: function noRefCheck() {},
                    },
                  }}
                />
              </div>
              <div flex={3} className="divDetailGerente">
                <Labels>UF</Labels>
                <Chip
                  id="ufsChips"
                  className="ufsChips"
                  close={false}
                  closeIcon={<Icon className="close">close</Icon>}
                  options={{
                    data: ufsSelects !== undefined ? ufsSelects : [],
                    onChipAdd: this.onChangeSelectUf,
                    onChipDelete: this.onChangeSelectUf,
                    autocompleteOptions: {
                      data: ufsChips,
                      limit: 1,
                      onAutocomplete: function noRefCheck() {},
                    },
                  }}
                />
              </div>
              <div>
                <Labels>Empresa</Labels>
                <Chip
                  id="companysChips"
                  className="companysChips"
                  close={false}
                  closeIcon={<Icon className="close">close</Icon>}
                  options={{
                    data: companysSelects !== undefined ? companysSelects : [],
                    onChipAdd: this.onChangeSelectCompany,
                    onChipDelete: this.onChangeSelectCompany,
                    autocompleteOptions: {
                      data: companysChips,
                      limit: 1,
                      onAutocomplete: function noRefCheck() {},
                    },
                  }}
                />
              </div>
              <Button
                onClick={() => this.setState({ openFilters: false })}
                className="waves-effect waves-light saib-button is-primary"
              >
                Filtrar produtos
              </Button>
            </DialogContent>
          </DialogOptions>
        )}
      </>
    );
  }
}

export default withRouter(OrderDirect);
