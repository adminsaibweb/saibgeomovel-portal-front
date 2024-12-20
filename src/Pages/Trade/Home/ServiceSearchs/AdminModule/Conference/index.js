import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Scanner } from './Scanner';
import { CardChoiceProduct, Container, ContainerCollapsibleAndBtns, ContentCollapsible } from './style';
import { Button, Collapsible, CollapsibleItem, Icon } from 'react-materialize';
import { getBase64, handleGetDataInventory } from '../../../tradeGlobalFunctions';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { Labels, Titulo } from '../../../style';
import som from '../../../../../../assets/store-scanner-beep-90395.mp3';
import { getFromStorage } from '../../../../../../services/auth';
import { ProductCard } from '../components/ProductCard';
// import { BiBarcodeReader } from 'react-icons/bi';
import { IoIosCheckmarkCircle, IoIosArrowBack } from 'react-icons/io';
import { alerta, getScheduleData, updateScheduleData } from '../../../../../../services/funcoes';
import { format } from 'date-fns';

class Conference extends Component {
  state = {
    status: 0,
    loading: false,
    percentage: 0,
    message: 0,
    inventory: [],
    products: [],
    finish: false,
    coding: '',
    quantityProduct: 1,
    productNotLot: false,
    typingCode: false,
    lastAddPos: null,
    editProduct: false,
    choiceProduct: null,
    delayScanner: false,
    image: null,
  };

  componentDidMount = async () => {
    const { cliente, pesquisas } = this.props.history.location.state;
    await this.carregarVariaveisEstado();
    const scheduleData = await getScheduleData()

    let inventory = scheduleData.CONFERENCE.INVENTORY;

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

    inventory = inventory?.filter((e) => e.QTDE - e.QTDE_UTILIZADA > 0 && e.CODIGO_BARRAS !== null);

    this.setState({
      cliente,
      pesquisas,
      inventory,
      products: scheduleData.CONFERENCE ? scheduleData.CONFERENCE.PRODUCTS : [],
      loading: false,
      lastAddPos: scheduleData.CONFERENCE ? scheduleData.CONFERENCE.lastAddPos : false,
      finish: scheduleData.CONFERENCE ? scheduleData.CONFERENCE.finishConference : false,
      status: scheduleData.CONFERENCE ? (scheduleData.CONFERENCE.finishConference ? 2 : 0) : 0,
      openConference: scheduleData.CONFERENCE ? scheduleData.CONFERENCE.open : true,
    });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
    });
  };

  handleBarCode = async (result) => {
    try {
      const { inventory, products, lastAddPos, delayScanner } = this.state;

      document.getElementById('inputAux').focus();
      if (delayScanner) {
        return;
      }
      this.setState({ delayScanner: true, loading: true });
      const scheduleData = await getScheduleData()

      const multiProduct = inventory?.filter((e) => result.includes(e.CODIGO_BARRAS) && e.QTDE - e.QTDE_UTILIZADA > 0);

      let newProduct = products?.find((e) => result.includes(e.CODIGO_BARRAS));

      if (multiProduct && multiProduct.length > 1) {
        let productAux = multiProduct?.filter((e) => `${result}`.includes(e.LOTE.substring(4)));


        if (productAux && productAux.length === 1) {
          newProduct = productAux[0];
        } else {
          productAux = multiProduct?.find((e) =>
            `${result}`.includes(format(new Date(e.DATA_VALIDADE), 'yy/MM/dd').replaceAll('/', ''))
          );
          if (productAux) {
            newProduct = productAux;
          } else {
            this.setState({
              status: 0,
              typingCode: false,
              loading: false,
              choiceProduct: multiProduct,
            });
            return;
          }
        }
      } else if (multiProduct && multiProduct.length === 1) {
        newProduct = multiProduct[0];
      }

      let lastAddPosAux = lastAddPos;

      if (newProduct && newProduct.STATUS === 2) {
        this.setState({ messageError: 'Já existe um pedido com esse produto', coding: '', loading: false });
        return;
      }

      if (!newProduct) {
        newProduct = inventory?.find((e) => result.includes(e.CODIGO_BARRAS));
        if (newProduct) {
          if (newProduct?.LOTE && newProduct?.SERIE) {
            newProduct.QTDE_LIDO = newProduct.QTDE_UTILIZADA + 1;
          }
          products.push(newProduct);
          lastAddPosAux = products.length - 1;
        }
      } else {
        const pos = products?.findIndex((e) => e.ESIN_ID === newProduct.ESIN_ID);

        if (pos !== -1) {
          if (products[pos]?.LOTE && products[pos]?.SERIE) {
            products[pos].QTDE_LIDO = (Number(products[pos].QTDE_LIDO) || 0) + 1;
          }
          lastAddPosAux = pos;
        } else {
          newProduct.QTDE_LIDO = newProduct.QTDE_UTILIZADA + 1;
          products.push(newProduct);
        }
      }

      if (!newProduct) {
        this.setState({
          messageError: 'Código de barras inválido',
          coding: '',
          delayScanner: false,
          loading: false,
        });
        return;
      }

      this.setState({ lastAddPos: lastAddPosAux });
      await updateScheduleData(scheduleData)

      scheduleData.CONFERENCE.PRODUCTS = products;
      await updateScheduleData(scheduleData)
      this.setState({ products });

      this.setState({
        messageError: `${newProduct.PROD_DESCR} - CONFERIDO COM SUCESSO`,
        coding: '',
      });

      const audio = document.getElementById('audio');
      audio.play();
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        const doc = document.getElementById('inputCodebar');
        if (doc) {
          document.getElementById('inputCodebar').focus();
        }
        this.setState({ delayScanner: false, loading: false });
      }, 1000);
      setTimeout(() => {
        this.setState({
          messageError: false,
        });
      }, 5000);
    }
  };

  handleMultipleCode = async (chosenProduct) => {
    const { lastAddPos, products, delayScanner } = this.state;
    const scheduleData = await getScheduleData()

    if (delayScanner) {
      return;
    }
    this.setState({ delayScanner: true, loading: true });

    if (!chosenProduct) {
      this.setState({
        messageError: `Produto não encontrado`,
        coding: '',
        loading: false,
        delayScanner: false,
      });
      return;
    }

    let newProduct = products?.find((e) => e.ESIN_ID === chosenProduct.ESIN_ID);

    let lastAddPosAux = lastAddPos;

    if (newProduct && newProduct.STATUS === 2) {
      this.setState({
        messageError: `Já existe um pedido com esse produto`,
        coding: '',
        loading: false,
        delayScanner: false,
      });
      return;
    }

    if (!newProduct) {
      newProduct = chosenProduct;
      if (newProduct?.LOTE && newProduct?.SERIE) {
        newProduct.QTDE_LIDO = newProduct.QTDE_UTILIZADA + 1;
        newProduct.MOD = true;
      }
      products.push(newProduct);
      lastAddPosAux = products.length - 1;
    } else {
      const pos = products?.findIndex((e) => e.ESIN_ID === chosenProduct.ESIN_ID);
      if (newProduct?.LOTE && newProduct?.SERIE) {
        newProduct.QTDE_LIDO = (newProduct.QTDE_LIDO || 0) + 1;
      }

      if (pos !== -1) {
        newProduct.MOD = true;
        products[pos] = newProduct;
        lastAddPosAux = pos;
      }
    }

    this.setState({ lastAddPos: lastAddPosAux });
    await updateScheduleData(scheduleData)

    scheduleData.CONFERENCE.PRODUCTS = products;
    await updateScheduleData(scheduleData)
    this.setState({ products, choiceProduct: null });

    this.setState({
      messageError: `${newProduct.PROD_DESCR} - CONFERIDO COM SUCESSO`,
      coding: '',
    });

    const audio = document.getElementById('audio');
    audio.play();

    setTimeout(() => {
      const doc = document.getElementById('inputCodebar');
      if (doc) {
        document.getElementById('inputCodebar').focus();
      }
      this.setState({ choiceProduct: null, delayScanner: false, loading: false, typingCode: true });
    }, 1000);
    setTimeout(() => {
      this.setState({
        messageError: false,
      });
    }, 5000);
  };

  handleQuantityProduct = async () => {
    const { quantityProduct, products, lastAddPos } = this.state;
    const scheduleData = await getScheduleData()
    const product = typeof lastAddPos === 'number' ? products[lastAddPos].CODIGO_BARRAS : products.at(-1);

    const posNewProduct = products?.findIndex((e) => e.CODIGO_BARRAS === product.CODIGO_BARRAS);
    let lastAddPosAux = lastAddPos;
    if (posNewProduct !== -1) {
      products[posNewProduct].QTDE_LIDO = products[posNewProduct].QTDE_LIDO + Number(quantityProduct);
      lastAddPosAux = posNewProduct;
    } else {
      const newProduct = products?.find((e) => e.CODIGO_BARRAS === product.CODIGO_BARRAS);
      newProduct.QTDE_LIDO = quantityProduct;
      products.push(newProduct);
      lastAddPosAux = products.length - 1;
    }

    scheduleData.CONFERENCE.PRODUCTS = products;
    scheduleData.CONFERENCE.lastAddPos = lastAddPosAux;
    await updateScheduleData(scheduleData)
    this.setState({ products, productNotLot: false, quantityProduct: 1, lastAddPos: lastAddPosAux });
  };

  handleFinished = async () => {
    try {
      let { inventory, products } = this.state;

      const scheduleData = await getScheduleData()
      const items = [];

      inventory.forEach((item) => {
        const exist = products?.find((e) => e.ESIN_ID === item.ESIN_ID);
        if (!exist) {
          item.QTDE_LIDO = item.QTDE_UTILIZADA;
          items.push(item);
        }
      });

      products = [...products, ...items];

      scheduleData.CONFERENCE.PRODUCTS = products;
      await updateScheduleData(scheduleData)

      this.setState({ finish: true, status: 2, products });
      scheduleData.CONFERENCE.finishConference = true;

      await updateScheduleData(scheduleData)
    } catch (error) {
      console.error(error);
    }
  };

  handleEditProduct = async (pos) => {
    const { products } = this.state;
    const scheduleData = await getScheduleData()
    products[pos].QTDE_LIDO = 0;
    scheduleData.CONFERENCE.products = true;
    scheduleData.CONFERENCE.finishConference = false;

    await updateScheduleData(scheduleData)

    this.setState({ finish: false, products: products });
  };

  handleSendOrder = async (prod, posOrder) => {
    const { cliente, pesquisas } = this.state;
    const scheduleData = await getScheduleData()

    const orders = scheduleData.ORDERS.NEW || [];

    const exist = orders?.find((e) => e.CODIGO_BARRAS === prod.CODIGO_BARRAS);

    prod.QTDE_ORDER = prod.QTDE - prod.QTDE_LIDO;
    if (!exist) {
      orders.push(prod);
    } else {
      const pos = orders?.findIndex((e) => e.CODIGO_BARRAS === prod.CODIGO_BARRAS);
      if (pos !== -1) {
        orders[pos] = prod;
      }
    }

    scheduleData.ORDERS.NEW = orders;

    await updateScheduleData(scheduleData)
    this.props.history.push({
      pathname: '/NewOrder',
      state: {
        cliente: cliente,
        pesquisas: pesquisas,
        posOrder,
      },
    });
  };

  render() {
    const {
      cliente,
      pesquisas,
      status,
      loading,
      percentage,
      message,
      products,
      finish,
      coding,
      typingCode,
      quantityProduct,
      productNotLot,
      lastAddPos,
      editProduct,
      openConference,
      choiceProduct,
      image,
      messageError,
    } = this.state;

    return (
      <>
        {(status === 0 || status === 2) && (
          <>
            <WaitScreen loading={loading} percent={percentage} message={message} />

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
              <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Conferência de inventário</p>
              {openConference && products && products.length > 0 && !finish && (
                <button
                  onClick={this.handleFinished}
                  className="saib-button is-primary"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    color: '#8E44AD',
                    background: '#fff',
                    borderRadius: '4px',
                    fontSize: '16px',
                    marginRight: '5px',
                    gap: '0.2rem',
                  }}
                >
                  Finalizar
                  <IoIosCheckmarkCircle size={18} />
                </button>
              )}
              {openConference && finish && (
                <button
                  onClick={async () => {
                    this.setState({ finish: false, status: 0 });
                    const scheduleData = await getScheduleData()
                    scheduleData.CONFERENCE.finishConference = false;
                    await updateScheduleData(scheduleData)
                  }}
                  className="saib-button is-primary"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    color: '#8E44AD',
                    background: '#fff',
                    borderRadius: '4px',
                    fontSize: '16px',
                    marginRight: '5px',
                    gap: '0.2rem',
                  }}
                >
                  <IoIosArrowBack size={18} />
                  Voltar
                </button>
              )}
            </Titulo>
            <Container>
              {status === 0 && (
                <section style={{ width: '100%' }}>
                  {!choiceProduct && products && products.length > 0 && !typingCode && !finish && (
                    <div
                      style={{
                        width: '98%',
                        marginTop: '0.4rem',
                        marginLeft: '6px',
                        borderRadius: '5px',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          background: '#8E44AD',
                          padding: '1rem 0.5rem',
                          borderRadius: '5px 5px 0px 0px',
                        }}
                      >
                        <strong style={{ color: '#fff', fontSize: '1.2rem', marginLeft: '0.4rem', fontWeight: '700' }}>
                          Último código de barras:{' '}
                          {typeof lastAddPos === 'number'
                            ? products[lastAddPos].CODIGO_BARRAS
                            : products.at(-1).CODIGO_BARRAS}
                        </strong>
                      </div>
                      <ProductCard data={typeof lastAddPos === 'number' ? products[lastAddPos] : products.at(-1)} />
                      {productNotLot && (
                        <div style={{ width: '96%', marginLeft: '0.5rem' }}>
                          <strong style={{ color: '#000', fontSize: '1rem', fontWeight: '600' }}>
                            Informe a quantidade
                          </strong>
                          <input
                            type="number"
                            value={quantityProduct}
                            onChange={(event) => this.setState({ quantityProduct: event.target.value })}
                            onKeyUp={(event) => {
                              if (event.key === 'Enter') {
                                this.handleQuantityProduct();
                              }
                            }}
                          />
                          <Button
                            onClick={this.handleQuantityProduct}
                            style={{ gap: '0.3rem', marginBottom: '0.5rem', marginTop: '0.5rem', width: '100%' }}
                            className="waves-effect waves-light saib-button is-primary"
                          >
                            <Icon className="modal-close">check_circle</Icon>
                            Confirmar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {choiceProduct && (
                    <div
                      style={{
                        width: '98%',
                        marginTop: '0.4rem',
                        marginLeft: '6px',
                        borderRadius: '5px',
                        border: '1px solid #8E44AD',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          background: '#8E44AD',
                          padding: '1rem 0.5rem',
                          borderRadius: '5px 5px 0px 0px',
                        }}
                      >
                        <strong style={{ color: '#fff', fontSize: '1.2rem', marginLeft: '0.4rem', fontWeight: '700' }}>
                          Último código de barras: {choiceProduct[0].CODIGO_BARRAS}
                        </strong>
                      </div>
                      <div
                        style={{
                          padding: '0.3rem 0.4rem',
                        }}
                      >
                        <strong
                          style={{ color: '#000', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.4rem' }}
                        >
                          Selecione uma opção
                        </strong>
                        {choiceProduct.map((item) => (
                          <CardChoiceProduct onClick={() => this.handleMultipleCode(item)}>
                            <span style={{ fontWeight: '700' }}>LOTE / SERIE</span>
                            <span style={{ marginTop: '-0.2rem' }}>
                              {item.LOTE} / {item.SERIE}
                            </span>
                            <span style={{ fontSize: '0.8rem', marginTop: '-0.2rem', color: '#404040' }}>
                              {item.PROD_DESCR}
                            </span>
                          </CardChoiceProduct>
                        ))}
                      </div>
                    </div>
                  )}
                  {typingCode && (
                    <Button
                      onClick={() => this.setState({ typingCode: false })}
                      className="saib-button is-primary"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        color: '#fff',
                        background: '#8E44AD',
                        borderRadius: '4px',
                        fontSize: '1.2rem',
                        marginLeft: '0.4rem',
                        marginTop: '5px',
                        gap: '0.2rem',
                        width: '98%',
                      }}
                    >
                      <Icon className="modal-close">arrow_back</Icon>
                      Voltar
                    </Button>
                  )}
                  {/* {openConference && !finish && (
                    <>
                      <label
                        htmlFor="inputScanner"
                        className="btn-conference"
                        style={{ gap: '0.3rem', margin: '0.5rem 0.3rem', width: '98%', fontSize: '1rem' }}
                      >
                        {products && products.length === 0 && 'Iniciar conferência'}
                        {products && products.length > 0 && 'Continuar conferência'}
                        <BiBarcodeReader size={20} />
                      </label>

                      <input
                        className="hidden"
                        id="inputScanner"
                        type="file"
                        accept="image/*"
                        capture
                        onChange={async (event) => {
                          this.setState({ delayScanner: false, typingCode: false });
                          const res = event.target.files[0];
                          const resData = await getBase64(res);
                          this.setState({ image: resData });
                        }}
                      />
                    </>
                  )} */}
                  {openConference && !finish && (
                    <Button
                      onClick={() => {
                        this.setState({ typingCode: true, coding: '', choiceProduct: null });
                        const doc = document.getElementById('inputCodebar');
                        if (doc) {
                          document.getElementById('inputCodebar').focus();
                        }
                      }}
                      style={{ gap: '0.3rem', margin: '0.5rem 0.3rem', width: '98%' }}
                      className="btn-conference"
                    >
                      <Icon className="modal-close">keyboard</Icon>
                      Digitar código de barras
                    </Button>
                  )}

                  <input
                    type="text"
                    id="inputAux"
                    style={{ opacity: '0', position: 'absolute', zIndex: '-1', caretColor: 'transparent' }}
                  />

                  {typingCode && (
                    <div
                      style={{
                        width: '96%',
                        marginLeft: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <strong style={{ color: '#000', fontSize: '1.2rem', marginLeft: '0.4rem', fontWeight: '700' }}>
                        Digite o código de barras do produto
                      </strong>
                      <input
                        autoFocus
                        type="text"
                        id="inputCodebar"
                        value={coding}
                        onChange={(event) => this.setState({ coding: event.target.value })}
                        onKeyUp={(event) => {
                          if (event.key === 'Enter') {
                            this.handleBarCode(coding);
                          }
                        }}
                      />

                      <Button
                        onClick={() => this.handleBarCode(coding)}
                        style={{ gap: '0.3rem', marginBottom: '0.5rem', marginTop: '0.2rem', width: '100%' }}
                        className="waves-effect waves-light saib-button is-primary"
                      >
                        Confirmar
                      </Button>

                      {messageError && (
                        <Labels
                          color="#fff"
                          fontSize={'1.2rem'}
                          fontWeight="500"
                          style={{
                            background: '#8e44ad',
                            padding: '0.6rem 0.8rem',
                            color: '#fff',
                            marginTop: '0.2rem',
                            textAlign: 'center',
                            borderRadius: '0.3rem',
                          }}
                        >
                          {messageError}
                        </Labels>
                      )}
                    </div>
                  )}

                  {products && products.length > 0 && !typingCode && !finish && (
                    <div style={{ width: '100%' }}>
                      <strong style={{ color: '#000', fontSize: '1.2rem', marginLeft: '0.4rem' }}>
                        {products.length === 1 && `${products.length} produto escaneado`}
                        {products.length > 1 && `${products.length} produtos escaneados`}
                      </strong>
                      <div style={{ overflowY: 'auto', height: '38vh' }}>
                        {products.map((prod) => (
                          <ContainerCollapsibleAndBtns key={`${prod.ESIN_ID}_${prod.PROD_ID}`}>
                            <ContentCollapsible className="collapsibleQuestionManager">
                              <Collapsible
                                accordion={false}
                                style={{
                                  width: '100%',
                                  borderStyle: 'none',
                                  boxShadow: 'none',
                                }}
                                className="collapsibleQuestionManager"
                              >
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
                                        padding: '3px 0px',
                                        gap: '5px',
                                      }}
                                    >
                                      {!prod.MOD && (
                                        <span>
                                          {prod.PROD_CODIGO} - <strong>{prod.PROD_DESCR}</strong>
                                        </span>
                                      )}
                                      {prod.MOD && (
                                        <span>
                                          {prod.LOTE} / {prod.SERIE} - <strong>{prod.PROD_DESCR}</strong>
                                        </span>
                                      )}
                                    </div>
                                  }
                                  node="div"
                                >
                                  <ProductCard data={prod} />
                                </CollapsibleItem>
                              </Collapsible>
                            </ContentCollapsible>
                          </ContainerCollapsibleAndBtns>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
              {status === 2 && (
                <section
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  <div style={{ height: '98%', overflowY: 'auto', margin: '0.3rem' }}>
                    {products
                      .filter((e) => e.QTDE - e.QTDE_LIDO > 0)
                      .map((prod, index) => (
                        <div key={`${prod.ESIN_ID}_${prod.PROD_ID}`}>
                          <div
                            className="card"
                            style={{ fontSize: '16px', borderRadius: '5px', border: '1px solid #8e44ad' }}
                          >
                            <div
                              style={{
                                padding: '4px 6px',
                                background: '#8e44ad',
                                borderRadius: '5px 5px 0px 0px',
                                color: '#fff',
                                width: '100%',
                              }}
                            >
                              <p style={{ fontWeight: '700' }}>{prod.PROD_DESCR}</p>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.6rem',
                                padding: '0 0.2rem',
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
                            <div
                              style={{ borderBottom: '1px solid #8e44ad', marginTop: '0.2rem', padding: '0 0.2rem' }}
                            >
                              <span style={{ color: '#8e44ad', fontWeight: '600' }}>
                                {prod.QTDE - prod.QTDE_LIDO === prod.QTDE ? 'Não conferido' : 'Quantidades'}
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                padding: '0 0.2rem',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '0.2rem',
                                  width: '67%',
                                }}
                              >
                                <span>
                                  <strong>Lido/Utilizado:</strong> {prod.QTDE_LIDO}
                                </span>
                                {typeof editProduct === 'number' && editProduct === index && (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '0.6rem',
                                      padding: '0 0.2rem',
                                    }}
                                  >
                                    <input
                                      type="number"
                                      value={quantityProduct}
                                      max={prod.QTDE}
                                      onChange={(event) => this.setState({ quantityProduct: event.target.value })}
                                    />
                                    <Button
                                      onClick={async () => {
                                        const scheduleData = await getScheduleData()
                                        products[index].QTDE_LIDO = quantityProduct;
                                        scheduleData.CONFERENCE.PRODUCTS = products;
                                        await updateScheduleData(scheduleData)
                                        this.setState({ products, quantityProduct: 0, editProduct: false });
                                      }}
                                      className="waves-effect waves-light saib-button is-primary"
                                    >
                                      <Icon className="modal-close">check_circle</Icon>
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <span>
                                <strong>Consignado:</strong> {prod.QTDE}
                              </span>
                            </div>
                            <span style={{ padding: '0 0.2rem' }}>
                              <strong>Diferença:</strong> {prod.QTDE - prod.QTDE_LIDO}
                            </span>

                            {openConference && prod.STATUS !== 2 && prod.QTDE - prod.QTDE_LIDO > 0 && (
                              <>
                                <label
                                  htmlFor="inputScanner"
                                  className="btn-conference"
                                  onClick={() => {
                                    if (!prod.LOTE || !prod.SERIE) {
                                      this.setState({ editProduct: index, quantityProduct: prod.QTDE_LIDO });
                                    } else {
                                      this.handleEditProduct(index);
                                    }
                                  }}
                                  style={{
                                    gap: '0.3rem',
                                    margin: '0.2rem',
                                    width: '98%',
                                  }}
                                >
                                  <Icon className="modal-close">create</Icon>
                                  Editar
                                </label>

                                <input
                                  className="hidden"
                                  id="inputScanner"
                                  type="file"
                                  accept="image/*"
                                  capture
                                  onChange={async (event) => {
                                    const res = event.target.files[0];
                                    const resData = await getBase64(res);
                                    this.setState({ image: resData });
                                  }}
                                />
                              </>
                            )}
                            {prod.STATUS !== 2 && prod.QTDE - prod.QTDE_LIDO > 0 && (
                              <Button
                                onClick={() => this.handleSendOrder(prod, index)}
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
                            )}
                            {prod.STATUS === 2 && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '0.2rem',
                                  gap: '0.3rem',
                                  background: '#8e44ad',
                                  color: '#fff',
                                  fontWeight: '600',
                                  marginTop: '0.3rem',
                                }}
                              >
                                Pedido realizado! <Icon className="modal-close">check_circle</Icon>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  {openConference && (
                    <Button
                      onClick={async () => {
                        const scheduleData = await getScheduleData()
                        scheduleData.CONFERENCE.open = false;
                        await updateScheduleData(scheduleData)
                        this.setState({ openConference: false });
                        this.props.history.push({
                          pathname: '/InventoryModule',
                          state: {
                            cliente: cliente,
                            pesquisas: pesquisas,
                          },
                        });
                      }}
                      style={{
                        gap: '0.3rem',
                        margin: '0.6rem 0.2rem 0.2rem',
                        width: '98%',
                      }}
                      className="waves-effect waves-light saib-button is-primary"
                    >
                      Encerrar conferência
                    </Button>
                  )}
                </section>
              )}
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

export default withRouter(Conference);
