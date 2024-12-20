import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Button, Collapsible, CollapsibleItem, Icon } from 'react-materialize';
import { handleGetDataInventory } from '../../../tradeGlobalFunctions';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { Labels, Titulo } from '../../../style';
import { getFromStorage } from '../../../../../../services/auth';
import { alerta, formatOracleDateToBr, getScheduleData, updateScheduleData } from '../../../../../../services/funcoes';
import { Container, ContentCollapsible } from '../Conference/style';
// import { BiBarcodeReader } from 'react-icons/bi';
import { Scanner } from '../Conference/Scanner';
import som from '../../../../../../assets/store-scanner-beep-90395.mp3';

class CreateOrder extends Component {
  state = {
    cliente: undefined,
    pesquisas: undefined,
    loading: false,
    products: [],
    productsOrigin: [],
    order: [],
    coding: '',
    typingCode: false,
    status: 0,
    searchProduct: '',
  };

  componentDidMount = async () => {
    const { cliente, pesquisas, order } = this.props.history.location.state;
    await this.carregarVariaveisEstado();
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

    if (order) {
      this.setState({
        order,
      });
    }

    this.setState({
      cliente: cliente,
      pesquisas: pesquisas,
      productsOrigin: inventory,
      products: inventory,
      loading: false,
    });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
    });
  };

  handleAddProduct = async (prod) => {
    const { products, order } = this.state;

    const currentProduct = products.findIndex((e) => e.PROD_ID === prod.PROD_ID && e.ESIN_ID === prod.ESIN_ID && e.LOTE === prod.LOTE && e.SERIE === prod.SERIE);

    if (currentProduct !== -1 && products[currentProduct].QTDE - 1 >= 0) {
      products[currentProduct].QTDE = products[currentProduct].QTDE - 1;

      let newRequest = order?.find((e) => e.ESIN_ID === prod.ESIN_ID);
      if (newRequest) {
        const pos = order?.findIndex((e) => e.ESIN_ID === prod.ESIN_ID);
        const lido = order[pos].QTDE_LIDO + 1;
        order[pos].QTDE_LIDO = lido;
        order[pos].QTDE_ORDER = lido;
      } else {
        newRequest = { ...products[currentProduct] };
        newRequest.QTDE_LIDO = 1;
        newRequest.QTDE_ORDER = 1;
        order.push(newRequest);
        alerta('Produto adicionado ao pedido', 1);
      }

      this.setState({ products, order });
    }
  };

  handleRemoveProduct = async (prod, index) => {
    const { order, products } = this.state;

    if (order[index].QTDE_LIDO > 0) {
      const pos = products?.findIndex((e) => e.ESIN_ID === prod.ESIN_ID);
      if (pos !== -1) {
        products[pos].QTDE += 1;
        products[pos].QTDE_ORDER -= 1;
      }
      order[index].QTDE_LIDO -= 1;

      this.setState({ products, order });
    }
  };

  handleSendOrder = async () => {
    const { cliente, pesquisas, order } = this.state;
    const scheduleData = await getScheduleData()

    await updateScheduleData(scheduleData)
    this.props.history.push({
      pathname: '/NewOrder',
      state: {
        cliente: cliente,
        pesquisas: pesquisas,
        pageNew: true,
        order,
      },
    });
  };

  handleExitScanner = () => {
    window.location.reload();
  };

  onDetected = async (result) => {
    try {
      const { status } = this.state;
      if (status === 0) {
        return;
      }

      await this.handleBarCode(result);
    } catch (error) {
      console.log(error);
    }
  };

  handleBarCode = async (result) => {
    const { productsOrigin } = this.state;
    const filterProducts = productsOrigin?.filter((e) => result.includes(e.CODIGO_BARRAS));

    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .then(() => console.log('#'))
        .catch((err) => console.error(err));
    }
    window.screen.orientation.lock('portrait');

    const audio = document.getElementById('audio');
    audio.play();

    this.setState({ products: filterProducts || [], status: 0, typingCode: false, searchProduct: '' });
  };

  handleTypingCode = () => {
    this.setState({ typingCode: true, coding: '' });
  };

  render() {
    const {
      cliente,
      pesquisas,
      products,
      order,
      loading,
      status,
      typingCode,
      coding,
      searchProduct,
      productsOrigin,
      image,
    } = this.state;

    let filteredProducts = products?.sort(function (a, b) {
      return a?.PROD_DESCR?.toLowerCase() > b?.PROD_DESCR?.toLowerCase()
        ? 1
        : -1
    })

    filteredProducts = products.filter((product) => {
      return searchProduct.includes(product.CODIGO_BARRAS) || product.PROD_DESCR.toLowerCase().includes(searchProduct.toLowerCase()) || product.LOTE.toLowerCase().includes(searchProduct.toLowerCase());
    });

    return (
      <>
        {status === 0 && (
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
              <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Novo pedido</p>
            </Titulo>
            <Container>
              <section style={{ width: '100%' }}>
                {order && order.length > 0 && (
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
                              background: '#8e44ad',
                              color: '#fff',
                              borderRadius: '5px',
                            }}
                          >
                            <span>{order.length} produtos no pedido</span>
                          </div>
                        }
                        node="div"
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {order.map((item, index) => (
                            <div
                              key={item.ESIN_ID}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                                borderBottom: '1px solid #ccc',
                              }}
                            >
                              <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>{item.PROD_DESCR}</span>
                              <span style={{ fontWeight: '500', fontSize: '1.2rem' }}>Qtde: {item.QTDE_LIDO}</span>
                              <button
                                onClick={() => this.handleRemoveProduct(item, index)}
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
                          ))}
                          <Button
                            onClick={this.handleSendOrder}
                            style={{
                              gap: '0.3rem',
                              margin: '0.6rem 0.2rem 0.2rem',
                              width: '98%',
                            }}
                            className="btn-conference"
                          >
                            <Icon className="modal-close">send</Icon>
                            Enviar pedido
                          </Button>
                        </div>
                      </CollapsibleItem>
                    </Collapsible>
                  </ContentCollapsible>
                )}

                <Button
                  onClick={this.handleTypingCode}
                  style={{ gap: '0.3rem', margin: '0.5rem 0.3rem', width: '98%' }}
                  className="btn-conference"
                >
                  <Icon className="modal-close">keyboard</Icon>
                  Digitar código de barras
                </Button>

                <Button
                  onClick={() => this.setState({ products: productsOrigin })}
                  style={{ gap: '0.3rem', margin: '0.5rem 0.3rem', width: '98%' }}
                  className="waves-effect waves-light saib-button is-primary"
                >
                  Ver todos os produtos
                </Button>

                {typingCode && (
                  <div style={{ width: '96%', marginLeft: '6px' }}>
                    <strong style={{ fontWeight: '500', fontSize: '1rem', padding: '0.5rem 0.2rem' }}>
                      Digite o código de barras do produto
                    </strong>
                    <input
                      type="text"
                      value={coding}
                      onChange={(event) => this.setState({ coding: event.target.value })}
                      onKeyUp={(event) => {
                        if (event.key === 'Enter') {
                          this.handleBarCode(coding);
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      onClick={() => this.setState({ typingCode: false })}
                      style={{ gap: '0.3rem', marginBottom: '0.5rem', marginTop: '0.2rem', width: '100%' }}
                      className="waves-effect waves-light saib-button is-primary"
                    >
                      <Icon>clear</Icon>
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => this.handleBarCode(coding)}
                      style={{ gap: '0.3rem', marginBottom: '0.5rem', marginTop: '0.2rem', width: '100%' }}
                      className="waves-effect waves-light saib-button is-primary"
                    >
                      <Icon>search</Icon>
                      Buscar
                    </Button>
                  </div>
                )}

                {!typingCode && (
                  <section style={{ width: '100%', padding: '10px 5px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px', width: '100%' }}>
                      <Labels>Nome do produto</Labels>
                      <input
                        type="text"
                        value={searchProduct}
                        onChange={(event) => this.setState({ searchProduct: event.target.value })}
                      />
                    </div>
                  </section>
                )}
                <p style={{ fontWeight: '700', fontSize: '1.2rem', padding: '0.2rem' }}>
                  Selecione os produtos para criar um pedido
                </p>
                {filteredProducts &&
                  filteredProducts.length > 0 &&
                  filteredProducts.map(
                    (prod, index) =>
                      prod.QTDE - prod.QTDE_UTILIZADA !== 0 && (
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                          key={`${prod.ESIN_ID}_${prod.PROD_ID}`}
                        >
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
                                      background: '#8e44ad',
                                      color: '#fff',
                                      borderRadius: '5px',
                                    }}
                                  >
                                    <span>
                                      <strong>{prod.PROD_DESCR}</strong> - {prod.LOTE} / {prod.SERIE}
                                    </span>{' '}
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
                                        Restante:{' '}
                                        <span style={{ fontWeight: '400' }}>{prod.QTDE - prod.QTDE_UTILIZADA}</span>
                                      </span>
                                    </div>
                                  </div>
                                }
                                node="div"
                              >
                                <div
                                  className="card"
                                  style={{ padding: '4px 6px', fontSize: '16px', borderRadius: '5px' }}
                                >
                                  <p>
                                    <strong>Código:</strong> {prod.PROD_CODIGO}
                                  </p>
                                  <p>
                                    <strong>Quantidade total:</strong> {prod.QTDE}
                                  </p>
                                  <p>
                                    <strong>Utilizado: </strong> {prod.QTDE_UTILIZADA}
                                  </p>

                                  <p>
                                    <strong>Quantidade em estoque: </strong> {prod.QTDE - prod.QTDE_UTILIZADA}
                                  </p>
                                  <p>
                                    <strong>Lote: </strong> {prod.LOTE}
                                  </p>
                                  <p>
                                    <strong>Série: </strong> {prod.SERIE}
                                  </p>
                                  {prod.DATA_FABRICACAO && (
                                    <p>
                                      <strong>Data fabricação: </strong> {formatOracleDateToBr(prod.DATA_FABRICACAO)}
                                    </p>
                                  )}
                                  <p>
                                    <strong>Data validade: </strong> {formatOracleDateToBr(prod.DATA_VALIDADE)}
                                  </p>
                                  <p>
                                    <strong>Data última alteração: </strong> {formatOracleDateToBr(prod.DATA_ALTERACAO)}
                                  </p>
                                  <Button
                                    onClick={() => this.handleAddProduct(prod)}
                                    style={{ display: 'flex', gap: '0.2rem', margin: '0.2rem' }}
                                    className="waves-effect waves-light saib-button is-primary"
                                  >
                                    Adicionar
                                    <Icon className="modal-close">add</Icon>
                                  </Button>
                                </div>
                              </CollapsibleItem>
                            </Collapsible>
                          </ContentCollapsible>
                          <button
                            onClick={() => this.handleAddProduct(prod)}
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
                            <Icon>add</Icon>
                          </button>
                        </div>
                      )
                  )}

                {(!filteredProducts || filteredProducts.length === 0) && (
                  <p style={{ fontWeight: '500', fontSize: '1rem', padding: '0.5rem 0.2rem' }}>
                    Nenhum produto encontrado
                  </p>
                )}
              </section>
            </Container>
          </>
        )}

        {image && (
          <Scanner
            image={image}
            onDetected={async (res) => {
              const inputElem = document.getElementById('inputScanner');
              if (inputElem) {
                inputElem.value = '';
              }
              await this.handleBarCode(res);
            }}
          />
        )}
        <audio id="audio" src={som}></audio>
      </>
    );
  }
}

export default withRouter(CreateOrder);
