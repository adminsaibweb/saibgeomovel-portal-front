import React, { forwardRef, useState } from 'react';
import { Button, Icon } from 'react-materialize';
import DatePicker from 'react-datepicker';
import { Container, DataFilter, DivDetalhe, Labels, Linha, TextAreaDiv } from './styled';
import api from '../../services/api';
import { alerta, haveData } from '../../services/funcoes';
import DirectTituloJanela from '../../Components/Globals/DirectTituloJanela';
import Header from '../../Components/System/Header';
import InputMask from 'react-input-mask';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import SelectQuery from '../../Components/Globals/SelectQuery';
import { getFromStorage } from '../../services/auth';
import { IoIosDocument, IoMdSave } from 'react-icons/io';
import { useHistory } from 'react-router-dom';

const CustomCalendarInput = forwardRef(({ value, onClick, onChange }, ref) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      width: '130px',
      justifyContent: 'space-around',
      borderBottom: '1px solid #ccc',
      zIndex: '50 !important',
    }}
  >
    <InputMask
      style={{ width: '100px', zIndex: '50 !important' }}
      mask="99/99/9999"
      value={value}
      maskChar={null}
      onChange={onChange}
      // onClick={onClick}
      // onBlur={(e) => this.handleValidarData(e, 'Data Inicial')}
    />
    <span onClick={onClick} style={{ cursor: 'pointer', color: 'rgb(97, 9, 138)' }}>
      <Icon>date_range</Icon>
    </span>
  </div>
));

export default function AddEvent() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSelect, setCustomerSelect] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [GEV_NIVEL_ALERTA, setGEV_NIVEL_ALERTA] = useState(null);
  const [GEV_ACESSO, setGEV_ACESSO] = useState(null);
  const [GEV_TIPO, setGEV_TIPO] = useState(null);
  const [GEV_DESCRICAO, setGEV_DESCRICAO] = useState(null);
  const [GEV_DOCUMENTO, setGEV_DOCUMENTO] = useState(null);

  const history = useHistory();

  const nivels = [
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
  ];

  const nivelsAcess = [
    { value: 1, label: '1 - Promotor' },
    { value: 2, label: '2 - Vendedor' },
    { value: 3, label: '3 - Ambos' },
  ];

  function handleSelectAcess(e) {
    if (e) {
      setGEV_ACESSO(e.value);
    } else {
      setGEV_ACESSO('');
    }
  }

  function handleSelectAlert(e) {
    if (e) {
      setGEV_NIVEL_ALERTA(e.value);
    } else {
      setGEV_NIVEL_ALERTA('');
    }
  }

  async function handleFilterCustomers(text) {
    try {
      setLoading(true);
      const sessao = getFromStorage();

      let url = `v1/schedule/clientes/${sessao.empresaId}/${sessao.codigoUsuario}`;
      const dataToSend = {
        filtro: String(text),
      };

      const retorno = await api.post(url, dataToSend);
      const { sucess, data } = retorno.data;

      if (sucess && data) {
        setCustomers(data);
      }
    } catch (err) {
      alerta('Erro ao carregar os clientes =>' + err, 2);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent() {
    try {
      setLoading(true);

      let documentRes = null;
      if (GEV_DOCUMENTO) {
        documentRes = await handleUploadDocument();
      }

      const payload = {
        GEV_CLI_ID: customerSelect?.CLI_ID,
        GEV_TIPO,
        GEV_DOCUMENTO: documentRes,
        GEV_NIVEL_ALERTA,
        GEV_ACESSO,
        GEV_DTA_INICIO: format(startDate, 'yyyy-MM-dd'),
        GEV_DTA_FIM: format(endDate, 'yyyy-MM-dd'),
        GEV_DESCRICAO,
      };
      const res = await api.post(`v1/pdv/events`, payload);

      const { sucess } = res.data;

      if (sucess) {
        alerta('Evento criado com sucesso', 1);
        history.push('/pdvevents');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadDocument() {
    try {
      const dataFile = new FormData();
      dataFile.append('image', GEV_DOCUMENTO);
      const sessao = getFromStorage();
      const res = await api.post('/v1/upload/ftp/' + sessao.empresaCnpj, dataFile);

      const { data } = res.data;

      if (haveData(data)) {
        return data;
      }
    } catch (error) {
      alerta('Erro ao salvar o documento em anexo', 2);
    }
  }

  async function handleChangeFile(event) {
    setLoading(true);
    const file = event.target.files[0];
    setGEV_DOCUMENTO(file);
    setLoading(false);
  }

  return (
    <>
      <div
        style={{
          display: loading !== false ? 'block' : 'none',
          position: 'absolute',
          height: '100vh',
          width: '100vw',
          top: '0px',
          left: '0px',
          backgroundColor: '#00000069',
          zIndex: '50',
        }}
        id="loading"
      />
      <Header />
      <Container>
        <DirectTituloJanela
          urlVoltar={'/pdvevents'}
          titulo={
            loading ? (
              'Aguarde...'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon>event_note</Icon>Adicionar evento
              </span>
            )
          }
        />
        <Linha style={{ alignItems: 'center', marginBottom: '0.5rem' }}>
          <DivDetalhe>
            <DataFilter loading={loading ? 1 : 0} style={{ flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Labels>Data inicial</Labels>
                <DatePicker
                  id="startDate"
                  selected={startDate}
                  onChange={(e) => setStartDate(e)}
                  locale={ptBR}
                  placeholderText="Data inicial"
                  dateFormat="dd/MM/yyyy"
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  customInput={<CustomCalendarInput />}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Labels>Data final</Labels>
                <DatePicker
                  selected={endDate}
                  onChange={(e) => setEndDate(e)}
                  selectsEnd
                  startDate={endDate}
                  endDate={endDate}
                  minDate={startDate}
                  locale={ptBR}
                  placeholderText="Data final"
                  dateFormat="dd/MM/yyyy"
                  customInput={<CustomCalendarInput />}
                />
              </div>
            </DataFilter>
          </DivDetalhe>
        </Linha>
        <Linha style={{ alignItems: 'center', marginBottom: '0.5rem' }}>
          <DivDetalhe style={{ width: '100%' }}>
            <Labels>Cliente</Labels>
            <SelectQuery
              onChangeComponentIsExternal
              loading={false}
              colorPrimary
              query={customers}
              keys={['CLI_ID', 'CLI_NOME_FANTASIA']}
              label="CLI_NOME_FANTASIA"
              onChange={async (text) => {
                await handleFilterCustomers(isNaN(text) ? text?.toUpperCase() : Number(text));
              }}
              onSelect={(item) => {
                setCustomerSelect(item);
              }}
              onDelete={() => {
                setCustomerSelect(null);
              }}
            />
          </DivDetalhe>
        </Linha>
        <Linha style={{ alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <DivDetalhe style={{ width: '100%' }}>
              <Labels>Nível alerta</Labels>
              <SelectQuery
                inputName="selectAlert"
                loading={false}
                itemSelected={GEV_NIVEL_ALERTA}
                colorPrimary
                query={nivels}
                keys={['value']}
                label="label"
                onSelect={handleSelectAlert}
                onDelete={handleSelectAlert}
              />
            </DivDetalhe>
            <DivDetalhe style={{ width: '100%' }}>
              <Labels>Nível acesso</Labels>
              <SelectQuery
                inputName="selectAcess"
                loading={false}
                itemSelected={GEV_ACESSO}
                colorPrimary
                query={nivelsAcess}
                keys={['value']}
                label="label"
                onSelect={handleSelectAcess}
                onDelete={handleSelectAcess}
              />
            </DivDetalhe>
          </div>
        </Linha>
        <Linha style={{ alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <DivDetalhe style={{ width: "45%" }}>
            <Labels>Tipo</Labels>
            <input type="text" maxLength={40} onChange={(event) => setGEV_TIPO(event.target.value)} />
          </DivDetalhe>
          <DivDetalhe>
            <Labels>Documento</Labels>
            <label
              htmlFor="uploadFile"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '6px',
                padding: '1rem 2rem',
                fontSize: '1rem',
                color: '#fff',
                background: '#8e44ad',
                cursor: 'pointer',
                fontWeight: GEV_DOCUMENTO ? '700' : '400',
              }}
            >
              <IoIosDocument size={22} weight="fill" />
              {GEV_DOCUMENTO ? 'Documento anexado' : 'Anexar documento'}
            </label>
            <input
              style={{ display: 'none' }}
              id="uploadFile"
              type="file"
              onChange={(event) => handleChangeFile(event)}
            />
          </DivDetalhe>
        </Linha>
        <Linha>
        <DivDetalhe style={{ width: "100%" }}>
            <Labels>Descrição</Labels>
            <TextAreaDiv>
              <textarea
                value={GEV_DESCRICAO}
                onChange={(event) => setGEV_DESCRICAO(event.target.value)}
                maxLength={512}
                cols={6}
              />
            </TextAreaDiv>
          </DivDetalhe>
        </Linha>
        <Linha style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button onClick={handleCreateEvent} className="waves-effect waves-light saib-button is-primary">
            <IoMdSave size={20} />
            Salvar
          </Button>
        </Linha>
      </Container>
    </>
  );
}
