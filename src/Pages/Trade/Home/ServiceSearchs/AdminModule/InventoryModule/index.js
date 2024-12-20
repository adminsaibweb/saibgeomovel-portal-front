import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Collapsible, CollapsibleItem, Icon } from 'react-materialize';
import { Titulo } from '../style';
import { ProductList } from '../components/ProductList';
import { Labels } from './style';
import { getFromStorage } from '../../../../../../services/auth';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { handleGetDataInventory } from '../../../tradeGlobalFunctions';
import { ContainerCollapsibleAndBtns, ContentCollapsible } from '../Conference/style';
import { alerta, getScheduleData } from '../../../../../../services/funcoes';

class InventoryModule extends Component {
  state = {
    cliente: undefined,
    pesquisas: undefined,
    loading: false,
    searchTerm: '',
    searchLot: '',
    products: [],
    conference: [],
  };

  componentDidMount = async () => {
    const { cliente, pesquisas } = this.props.history.location.state;
    const scheduleData = await getScheduleData()

    let inventory = scheduleData.CONFERENCE;
    if (inventory) {
      inventory = scheduleData.CONFERENCE.INVENTORY;
    }

    if (!inventory || inventory.length === 0) {
      const sessao = getFromStorage();
      this.setState({
        loading: true,
      });
      inventory = await handleGetDataInventory(sessao.empresaId, sessao.codigoUsuario, cliente.CLI_ID);
    }

    if (!inventory) {
      alerta('Não foi possível buscar os dados, verifique sua conexão com a internet', 2);
      this.setState({
        loading: false,
      });
      this.props.history.push({
        pathname: '/AdminModule',
        state: {
          cliente: cliente,
          pesquisas: pesquisas,
        },
      });
      return;
    }

    const conference = scheduleData.CONFERENCE ? scheduleData.CONFERENCE.PRODUCTS : [];

    this.setState({
      cliente: cliente,
      pesquisas: pesquisas,
      products: inventory,
      conference,
      loading: false,
    });
  };

  render() {
    const { cliente, pesquisas, searchTerm, products, conference, loading } = this.state;

    let filteredProducts = products?.sort(function (a, b) {
      return a?.PROD_DESCR?.toLowerCase() > b?.PROD_DESCR?.toLowerCase()
        ? 1
        : -1
    })

    filteredProducts = products.filter((product) => {
      return searchTerm.includes(product.CODIGO_BARRAS) || product.PROD_DESCR.toLowerCase().includes(searchTerm.toLowerCase()) || product.LOTE.toLowerCase().includes(searchTerm.toLowerCase());
    });

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
          <Link
            className="backToStartWorkDay"
            to={{
              pathname: '/AdminModule',
              state: {
                cliente: cliente,
                pesquisas: pesquisas,
              },
            }}
          >
            <button
              style={{ cursor: 'pointer', color: 'white' }}
              className="waves-effect waves-light saib-button is-cancel"
            >
              <Icon className="modal-close">arrow_back</Icon>
            </button>
          </Link>
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Inventário</p>
        </Titulo>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', marginTop: '10px', width: '100%' }}>
          <Labels>Produto</Labels>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => this.setState({ searchTerm: event.target.value })}
          />
        </div>
        {filteredProducts && filteredProducts.length > 0 && (
          <div>
            {filteredProducts.map((prod) => {
              if (
                prod.QTDE - prod.QTDE_UTILIZADA !== 0 ||
                conference?.find((e) => e.ESIN_ID === prod.ESIN_ID && e.QTDE_LIDO !== 0)
              ) {
                const currentProduct = conference?.find((e) => e.ESIN_ID === prod.ESIN_ID)
                const diff = currentProduct?.QTDE - currentProduct?.QTDE_LIDO

                return <ContainerCollapsibleAndBtns key={`${prod.ESIN_ID}_${prod.PROD_ID}_${prod.SERIE}_${prod.LOTE}`}>
                  <ContentCollapsible diff={diff < 0} className="collapsibleQuestionManager">
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
                              background: diff < 0 ? "#ed3241" : '#8e44ad',
                              color: '#fff',
                              borderRadius: '5px',
                            }}
                          >
                            <span>
                              {prod.PROD_CODIGO} - <strong>{prod.PROD_DESCR}</strong> - {prod.LOTE}
                            </span>{' '}
                            {conference?.find((e) => e.ESIN_ID === prod.ESIN_ID && e.QTDE_LIDO !== 0) && (
                              <span>Produto Conferido</span>
                            )}
                            {!conference?.find((e) => e.ESIN_ID === prod.ESIN_ID && e.QTDE_LIDO !== 0) && (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <span>
                                  Quantidade: <span style={{ fontWeight: '400' }}>{prod.QTDE}</span>
                                </span>
                                <span>
                                  Utilizado: <span style={{ fontWeight: '400' }}>{prod.QTDE_UTILIZADA}</span>
                                </span>
                                <span>
                                  Restante: <span style={{ fontWeight: '400' }}>{prod.QTDE - prod.QTDE_UTILIZADA}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        }
                        node="div"
                      >
                        <ProductList data={prod} conf={conference?.find((e) => e.ESIN_ID === prod.ESIN_ID)} />
                      </CollapsibleItem>
                    </Collapsible>
                  </ContentCollapsible>
                </ContainerCollapsibleAndBtns>;
              } else {
                return <></>;
              }
            })}
          </div>
        )}
        {(!filteredProducts || filteredProducts.length === 0) && (
          <p style={{ margin: '1rem', fontWeight: '700', fontSize: '1.2rem' }}>Nenhum produto encontrado</p>
        )}
      </>
    );
  }
}

export default withRouter(InventoryModule);
