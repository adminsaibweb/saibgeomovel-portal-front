import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import NumberFormat from 'react-number-format';
import { Labels, DivDetalhe, UploadFile, Linha } from '../style';
import { Icon, Checkbox, Button } from 'react-materialize';
import { alerta, dateTimeBrValid, timeBrValid, dateBrValid } from '../../../../services/funcoes';
import { getFromStorage } from '../../../../services/auth';
import './forced.css';
import { haveData } from '../../../../services/funcoes';
import { delLocalImage, getLocalImage, setLocalImage } from '../../../../services/databaseLocal';

import { getBase64 } from '../tradeGlobalFunctions';
import imageCompression from 'browser-image-compression';
import * as uniqid from 'uniqid';
import WaitScreen from '../../../../Components/Globals/WaitScreen';

class FieldSearch extends Component {
  state = {
    loading: false,
    hasChanged: -1,
    mostarKeyBoard: false,
    input: '',
  };

  componentDidMount = () => {
    let { pergunta, tipoCampo, campo, resposta, onChange, input } = this.state;
    campo = this.props.campo;
    resposta = this.props.resposta;
    onChange = this.props.onChange;
    tipoCampo = this.props.tipoCampo;
    pergunta = this.props.pergunta;
    input = this.props.resposta;

    this.setState({ pergunta, tipoCampo, campo, resposta, onChange, input });

    setTimeout(() => {
      this.getImage();
    }, 10);
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    return {
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCnpj: sessao.empresaCnpj,
      empresaCfId: sessao.empresaCfId,
      frotaId: sessao.frotaId,
      gmovel: sessao.gmovel,
      gmovelTrade: sessao.gmovelTrade,
      gmovelPromotor: sessao.gmovelPromotor,
      gmovelSupervisor: sessao.gmovelSupervisor,
    };
  };

  componentDidUpdate = () => {
    let { campo, resposta, hasChanged } = this.state;
    if (
      hasChanged !== this.props.hasChanged &&
      this.props.resposta !== undefined &&
      campo.GAC_ID === this.props.campo.GAC_ID &&
      resposta !== this.props.resposta
    ) {
      resposta = this.props.resposta;
      this.setState({ resposta, hasChanged: this.props.hasChanged });
      setTimeout(() => {
        this.getImage();
      }, 10);
    }
  };

  handleOnChangeResposta = (e, respostaForced) => {
    let { campo, pergunta, resposta } = this.state;

    if (
      (haveData(campo.GAC_VALOR_MAXIMO) || haveData(campo.GAC_VALOR_MINIMO)) &&
      pergunta.GPP_TIPO_CAMPO !== 12 &&
      e !== undefined &&
      e.floatValue === undefined &&
      e.target !== undefined &&
      e.target.value !== ''
    ) {
      //eslint-disable-line
      e.floatValue = Number(
        String(e.target.value)
          .replace(/\./g, '') /* eslint-disable-line */
          .replace(/\,/g, '.') /* eslint-disable-line */
          .replace(/[^0-9.]/g, '')
      );
    }

    if (
      (pergunta.GPP_TIPO_CAMPO === 9 || pergunta.GPP_TIPO_CAMPO === 3) &&
      e !== undefined &&
      e.floatValue === undefined &&
      e.target !== undefined &&
      e.target.value !== ''
    ) {
      e.floatValue = Number(
        String(e.target.value)
          .replace(/\./g, '') /* eslint-disable-line */
          .replace(/\,/g, '.') /* eslint-disable-line */
          .replace(/[^0-9.]/g, '')
      );
    }

    if (
      pergunta.GPP_TIPO_CAMPO === 4 &&
      e !== undefined &&
      e.target !== undefined &&
      e.target.value !== '' &&
      !dateBrValid(e.target.value)
    ) {
      alerta('Valor digitado inválido', 2);
      this.setState({ resposta: '' });
      e.target.focus();
      return;
    }

    if (
      pergunta.GPP_TIPO_CAMPO === 5 &&
      e !== undefined &&
      e.target !== undefined &&
      e.target.value !== '' &&
      !dateTimeBrValid(e.target.value)
    ) {
      alerta('Valor digitado inválido', 2);
      this.setState({ resposta: '' });
      e.target.focus();
      return;
    }

    if (
      pergunta.GPP_TIPO_CAMPO === 6 &&
      e !== undefined &&
      e.target !== undefined &&
      e.target.value !== '' &&
      !timeBrValid(e.target.value)
    ) {
      alerta('Valor digitado inválido', 2);
      this.setState({ resposta: '' });
      e.target.focus();
      return;
    }

    if (
      (haveData(campo.GAC_VALOR_MAXIMO) || haveData(campo.GAC_VALOR_MINIMO)) &&
      (e.floatValue < campo.GAC_VALOR_MINIMO || e.floatValue > campo.GAC_VALOR_MAXIMO)
    ) {
      alerta('Valor digitado inválido', 2);
      this.setState({ resposta: 0 });
      e.target.focus();
      return;
    }

    if (e !== undefined && e.target === undefined && e.formattedValue === undefined) {
      resposta = e || '';
    }

    if (e.floatValue !== undefined) {
      resposta = e.floatValue;
    }

    if (e.target !== undefined && e.target.type === 'checkbox') {
      if (pergunta.GPP_TIPO_CAMPO === 11) {
        if (!haveData(resposta) || resposta === '') {
          resposta = [];
        }
        if (e.target.checked) {
          if (resposta.find((item) => item === campo.GAC_ID) === undefined) {
            resposta.push(campo.GAC_ID);
          }
        } else {
          if (resposta.find((item) => item === campo.GAC_ID) !== undefined) {
            let position = resposta.indexOf(campo.GAC_ID);
            resposta = resposta.splice(position, 1);
          }
        }
      }
      if (pergunta.GPP_TIPO_CAMPO === 10 || pergunta.GPP_TIPO_CAMPO === 13) {
        resposta = campo.GAC_ID;
      }
    }

    if (e.target !== undefined && e.target.type === 'text' && e.floatValue === undefined) {
      resposta = e.target.value;
    }

    if (pergunta.GPP_TIPO_CAMPO === 12) {
      resposta = respostaForced;
    }

    this.setState({ resposta });
    this.props.onChange(e, pergunta, campo);
  };

  handleOnChangeFieldTwelve = (e, value) => {
    let { campo, pergunta, resposta } = this.state;
    resposta = value;

    this.setState({ resposta });
    this.props.onChange(e, pergunta, campo);
  };

  onKeyPress = (button) => {
    if (button === '{enter}') {
      this.setState({ mostarKeyBoard: false });
    } else {
      let { input } = this.state;
      if (String(input) !== '') {
        button += input;
      }
    }
  };

  onChange = (inputEnviada) => {
    let { input } = this.state;
    if (input !== inputEnviada) {
      input += inputEnviada;
    } else {
      input = inputEnviada;
    }

    this.setState({
      input,
    });

    this.handleOnChangeResposta(inputEnviada);
  };

  onShowKeyBoard = (className) => {
    let { mostarKeyBoard } = this.state;
    if (!mostarKeyBoard) {
      document.getElementsByClassName(className)[0].style.marginBottom = '200px!important';
    } else {
      document.getElementsByClassName(className)[0].style.marginBottom = 'unset';
    }
    this.setState({ mostarKeyBoard: !mostarKeyBoard });
    // if (!mostarKeyBoard){

    // }
  };

  handleChangeSearchImage = async (event, campo) => {
    let { resposta, pergunta } = this.state;
    this.setState({ loading: true, percent: 0, message: undefined });
    var imagem = event.target.files[0];

    let unId = uniqid();

    if (haveData(resposta) && resposta !== 'limpar' && resposta !== 'nao-se-aplica-eca82f') {
      unId = resposta || uniqid();
    } else {
      unId = uniqid();
    }

    try {
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      let compressedFile = await imageCompression(imagem, options);

      const resData = await getBase64(compressedFile.size > imagem.size ? imagem : compressedFile);

      this.setState({ resposta: unId, image: resData });
      let fileExtension = compressedFile.name.substring(
        compressedFile.name.lastIndexOf('.'),
        compressedFile.name.length
      );

      pergunta.URL = '';

      this.setState({ pergunta });

      await setLocalImage(unId, resData, unId + fileExtension);
      const inputElem = document.getElementById(`searchImage_${campo.GAC_ID}`);
      if (inputElem) {
        inputElem.value = '';
      }

      setTimeout(this.handleOnChangeResposta(unId), 50);
    } catch (error) {
      alerta(error, 2);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleChangeNoImage = async (campo) => {
    let { pergunta } = this.state;
    this.setState({ loading: true, percent: 0, message: undefined });

    let unId = 'nao-se-aplica-eca82f';

    const resData = 'https://imgweb.saibweb.com.br/entregas/imagens/37426786000100/nao-se-aplica-eca82f.png';

    this.setState({ resposta: unId, image: resData });
    pergunta.URL = '';

    const inputElem = document.getElementById(`searchImage_${campo.GAC_ID}`);
    if (inputElem) {
      inputElem.value = '';
    }
    this.setState({ loading: false, pergunta });
    setTimeout(this.handleOnChangeResposta(unId), 50);
  };

  getImage = async () => {
    let { resposta, pergunta, image } = this.state;

    if (pergunta.GPP_TIPO_CAMPO === 7 && resposta !== undefined && resposta !== 'limpar') {
      image = await getLocalImage(resposta);
      if (!image && resposta === 'nao-se-aplica-eca82f') {
        image = 'https://imgweb.saibweb.com.br/entregas/imagens/37426786000100/nao-se-aplica-eca82f.png';
      }

      if (!image) {
        image = pergunta.URL;
      }

      this.setState({ image });
    }
  };

  handleClearImage = async (event) => {
    let { resposta, image } = this.state;
    if (resposta) {
      await delLocalImage(resposta);
      resposta = 'limpar';
      image = '';
      this.handleOnChangeResposta(resposta);
      this.setState({ resposta, image });
    }
  };

  render() {
    let { loading, campo, resposta, tipoCampo, image, pergunta } = this.state;

    return (
      <>
        <WaitScreen loading={loading} />

        {/* Tipo de campo (
                              0 - TEXTO (ATÉ 255 CARACTERES) ok
                              | 1 - TEXTO GRANDE (ATÉ 1000 CARACTERES) ok
                              | 2 - INTEIRO ok
                              | 3 - DECIMAL (ATÉ 3 CASAS) ok
                              | 4 - DATA ok
                              | 5 - DATA/HORA
                              | 6 - HORA
                              | 7 - IMAGEM (CAMINHO DA IMAGEM - STRING 2048) ok
                              | 8 - BOOLEANO (0/FALSO OU 1/VERDADEIRO) ok
                              | 9 - MOEDA ok
                              | 10 - LISTA FIXA (APENAS UMA ESCOLHA) ok
                              | 11 - LISTA FIXA (MULTIPLA UMA ESCOLHA)
 (0 a 9 - Quanto maior o número maior a chance)
                              ) */}
        {campo !== undefined && campo.GAC_FLG_STATUS === 1 && (
          <>
            {haveData(campo.GAC_VALOR_MAXIMO) && pergunta.GPP_TIPO_CAMPO !== 12 && (
              <Linha className="legendaValor">
                <Labels fontWeight={200}>
                  (Digite valores entre {campo.GAC_VALOR_MINIMO} e {campo.GAC_VALOR_MAXIMO})
                </Labels>
              </Linha>
            )}

            {pergunta.GPP_TIPO_CAMPO === 12 && (
              <Linha className="legendaValor">
                <Labels fontWeight={200}>(Quanto maior o valor selecionado maior a chance)</Labels>
              </Linha>
            )}

            {tipoCampo === 0 && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  <input
                    type="text"
                    autoComplete="off"
                    className="campoTexto"
                    maxLength={255}
                    onChange={(e) => this.handleOnChangeResposta(e, campo)}
                    value={haveData(resposta) ? resposta : ''}
                  />
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 1 && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  <input
                    type="text"
                    autoComplete="off"
                    className="campoMemo"
                    maxLength={1000}
                    onChange={(e) => this.handleOnChangeResposta(e, campo)}
                    value={haveData(resposta) ? resposta : ''}
                  />
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 2 && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  <NumberFormat
                    thousandSeparator={'.'}
                    decimalSeparator={false}
                    // prefix={'R$ '}
                    decimalScale={'0'}
                    fixedDecimalScale={'true'}
                    id="campoInteiro"
                    value={resposta ? resposta : ''}
                    autoComplete="off"
                    onBlur={(e) => {
                      this.handleOnChangeResposta(e, campo);
                    }}
                  />
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 3 && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  <NumberFormat
                    thousandSeparator={'.'}
                    decimalSeparator={','}
                    autoComplete="off"
                    prefix={''}
                    decimalScale={'3'}
                    fixedDecimalScale={'true'}
                    id={'campoMoeda_' + String(campo.GAC_ID)}
                    value={resposta ? resposta : ''}
                    onBlur={(e) => {
                      this.handleOnChangeResposta(e, campo);
                    }}
                  />
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 4 && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  <NumberFormat
                    format={'##/##/####'}
                    autoComplete="off"
                    value={resposta !== undefined ? resposta : ''}
                    id="campoData"
                    // onValueChange={}
                    onBlur={(e) => {
                      this.handleOnChangeResposta(e, campo);
                    }}
                  />
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 5 && (
              <>
                <Linha className="legendaValor">
                  <Labels fontWeight={200}>Exemplo: 30/12/2021 17:20</Labels>
                </Linha>
                <DivDetalhe className="campos" flex={3}>
                  <NumberFormat
                    format={'##/##/#### ##:##'}
                    autoComplete="off"
                    value={resposta !== undefined ? resposta : ''}
                    id="campoDataHora"
                    // onValueChange={}
                    onBlur={(e) => {
                      this.handleOnChangeResposta(e, campo);
                    }}
                  />
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 6 && (
              <>
                <Linha className="legendaValor">
                  <Labels fontWeight={200}>Exemplo: 17:20</Labels>
                </Linha>
                <DivDetalhe className="campos" flex={3}>
                  <NumberFormat
                    format={'##:##'}
                    autoComplete="off"
                    value={resposta !== undefined ? resposta : ''}
                    id="campoHora"
                    // onValueChange={}
                    onBlur={(e) => {
                      this.handleOnChangeResposta(e, campo);
                    }}
                  />
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 7 && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  {image !== undefined && image !== '' && (
                    <Linha>
                      <img
                        src={image}
                        alt="campo.GAC_DESCRICAO"
                        style={{
                          maxWidth: '90%',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                          maxHeight: '200px',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    </Linha>
                  )}
                  {}
                  {(!haveData(resposta) || resposta === 'limpar') && pergunta.GPP_FLG_ORIGATORIA === -1 && (
                    <UploadFile>
                      <Button
                        className="waves-effect waves-light saib-button is-primary"
                        onClick={() => this.handleChangeNoImage(campo)}
                        style={{ flex: 2, gap: '6px' }}
                      >
                        <Icon>block</Icon>
                        Não se aplica
                      </Button>
                    </UploadFile>
                  )}
                  <UploadFile>
                    <Button
                      className="waves-effect waves-light saib-button is-primary"
                      onClick={() => document.getElementById(`searchImage_${campo.GAC_ID}`).click()}
                      style={{ flex: 2 }}
                    >
                      <Icon>photo_camera</Icon>
                    </Button>
                    <Button
                      className="waves-effect waves-light saib-button is-primary"
                      onClick={() => this.handleClearImage(campo)}
                      style={{ flex: 2 }}
                    >
                      <Icon>clear</Icon>
                    </Button>
                    <>
                      {campo.GAC_VALOR_PADRAO === '1' ? (
                        <>
                          <input
                            id={`searchImage_${campo.GAC_ID}`}
                            type="file"
                            value=""
                            accept="image/*"
                            onChange={(event) => this.handleChangeSearchImage(event, campo)}
                          />
                        </>
                      ) : (
                        <>
                          <input
                            id={`searchImage_${campo.GAC_ID}`}
                            type="file"
                            value=""
                            accept="image/*"
                            capture
                            onChange={(event) => this.handleChangeSearchImage(event, campo)}
                          />
                        </>
                      )}
                      <span id="file-name"></span>
                    </>
                  </UploadFile>
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 8 && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  <Checkbox
                    id={'Checkbox_' + campo.GAC_ID}
                    className="campoBooleano"
                    label={campo.GAC_DESCRICAO}
                    value={campo.GAC_VALOR_PADRAO}
                    checked={resposta === campo.GAC_ID}
                    onChange={(e) => this.handleOnChangeResposta(e, campo)}
                  />
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 9 && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  <NumberFormat
                    thousandSeparator={'.'}
                    decimalSeparator={','}
                    autoComplete="off"
                    prefix={'R$ '}
                    decimalScale={'2'}
                    fixedDecimalScale={'true'}
                    id={'campoMoeda_' + String(campo.GAC_ID)}
                    value={haveData(resposta) ? resposta : ''}
                    onBlur={(e) => {
                      this.handleOnChangeResposta(e, campo);
                    }}
                  />
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 10 && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  <Checkbox
                    id={'Checkbox_' + campo.GAC_ID}
                    className="campoListaUnica"
                    label={campo.GAC_DESCRICAO}
                    value={campo.GAC_VALOR_PADRAO}
                    checked={resposta !== undefined && resposta === campo.GAC_ID}
                    onChange={(e) => this.handleOnChangeResposta(e, campo)}
                  />
                </DivDetalhe>
              </>
            )}
            {(tipoCampo === 11 || tipoCampo === 13) && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  <Checkbox
                    id={'Checkbox_' + campo.GAC_ID}
                    className="campoListaMultipla"
                    label={campo.GAC_DESCRICAO}
                    value={campo.GAC_VALOR_PADRAO}
                    checked={resposta !== undefined && JSON.stringify(resposta).indexOf(campo.GAC_ID) !== -1}
                    onChange={(e) => this.handleOnChangeResposta(e, campo)}
                  />
                </DivDetalhe>
              </>
            )}
            {tipoCampo === 12 && (
              <>
                <DivDetalhe className="campos" flex={3}>
                  <Linha
                    className="linhaNps"
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                    }}
                  >
                    {parseInt(resposta) === 0 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 0);
                          }}
                        >
                          <span className="spanNps">0</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 0);
                          }}
                        >
                          <span className="spanNps">0</span>
                        </div>
                      </>
                    )}
                    {parseInt(resposta) === 1 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 1);
                          }}
                        >
                          <span className="spanNps">1</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 1);
                          }}
                        >
                          <span className="spanNps">1</span>
                        </div>
                      </>
                    )}
                    {parseInt(resposta) === 2 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 2);
                          }}
                        >
                          <span className="spanNps">2</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 2);
                          }}
                        >
                          <span className="spanNps">2</span>
                        </div>
                      </>
                    )}
                    {parseInt(resposta) === 3 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 3);
                          }}
                        >
                          <span className="spanNps">3</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 3);
                          }}
                        >
                          <span className="spanNps">3</span>
                        </div>
                      </>
                    )}
                    {parseInt(resposta) === 4 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 4);
                          }}
                        >
                          <span className="spanNps">4</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 4);
                          }}
                        >
                          <span className="spanNps">4</span>
                        </div>
                      </>
                    )}
                    {parseInt(resposta) === 5 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 5);
                          }}
                        >
                          <span className="spanNps">5</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 5);
                          }}
                        >
                          <span className="spanNps">5</span>
                        </div>
                      </>
                    )}
                    {parseInt(resposta) === 6 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 6);
                          }}
                        >
                          <span className="spanNps">6</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 6);
                          }}
                        >
                          <span className="spanNps">6</span>
                        </div>
                      </>
                    )}
                    {parseInt(resposta) === 7 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 7);
                          }}
                        >
                          <span className="spanNps">7</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 7);
                          }}
                        >
                          <span className="spanNps">7</span>
                        </div>
                      </>
                    )}
                    {parseInt(resposta) === 8 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 8);
                          }}
                        >
                          <span className="spanNps">8</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 8);
                          }}
                        >
                          <span className="spanNps">8</span>
                        </div>
                      </>
                    )}
                    {parseInt(resposta) === 9 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 9);
                          }}
                        >
                          <span className="spanNps">9</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 9);
                          }}
                        >
                          <span className="spanNps">9</span>
                        </div>
                      </>
                    )}
                    {parseInt(resposta) === 10 ? (
                      <>
                        <div
                          className="saib-button is-primary botaoNps botaoNpsSelected"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 10);
                          }}
                        >
                          <span className="spanNps">10</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="saib-button is-secondary botaoNps"
                          onClick={(e) => {
                            this.handleOnChangeFieldTwelve(e, 10);
                          }}
                        >
                          <span className="spanNps">10</span>
                        </div>
                      </>
                    )}
                  </Linha>
                </DivDetalhe>
              </>
            )}
          </>
        )}
      </>
    );
  }
}

export default withRouter(FieldSearch);
