import React, { forwardRef, Component } from 'react';
import Header from '../../../Components/System/Header';
import { DataFilter, Container, Linha, DivDetalhe } from '../ApprovalOfPurchaseOrder/styles';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import { Button, Icon } from 'react-materialize';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import ptBR from 'date-fns/locale/pt-BR';
import InputMask from 'react-input-mask';
import DatePicker from 'react-datepicker';
import { getFromStorage } from '../../../services/auth';
import { alerta } from '../../../services/funcoes';
import api from '../../../services/api';
import { compareAsc, format } from 'date-fns';
import { IoMdEye } from 'react-icons/io';
import { Table } from './styled';
import { FaFilter } from 'react-icons/fa';

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

class ApprovalOfSales extends Component {
  state = {
    loading: false,
    startDate: new Date(),
    endDate: new Date(),
    data: [],
    status: 'P',
    pageActive: 1,
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  onChangeStartDate = (e) => {
    this.setState({ startDate: e });
  };

  onChangeEndDate = (e) => {
    this.setState({ endDate: e });
  };

  onChangeFiltroSituacaoEntrega = (status) => {
    this.setState({ status });
  };

  onChangeFilter = async () => {
    try {
      this.setState({ loading: true });
      const { usuarioAtivo, empresaAtiva, status, startDate, endDate } = this.state;
      const params = {
        atd_flag_situacao: status,
        atd_data_inicial: format(startDate, 'dd/MM/yyyy'),
        atd_data_final: format(endDate, 'dd/MM/yyyy'),
      };

      const res = await api.get(`v1/approvalofsales/sales/${empresaAtiva}/${usuarioAtivo}`, {
        params,
      });

      const { sucess, data } = res.data;

      if (sucess) {
        const result = data?.sort(function (a, b) {
          return compareAsc(new Date(a.ATD_DATA), new Date(b.ATD_DATA));
        });
        await this.handleDataTable(result);
      }
    } catch (error) {
      alerta('Não foi possível buscar os dados', 2);
    } finally {
      this.setState({ loading: false, pageActive: 1 });
    }
  };

  handleChangeStatus = async (payload, status) => {
    try {
      const { usuarioAtivo, empresaAtiva } = this.state;
      this.setState({ loading: false });
      const dataFormat = new Date(payload.ATD_DATA);
      dataFormat.setHours(12, 0, 0, 0);

      payload.ATD_DATA = format(dataFormat, 'yyyy-MM-dd');
      payload.ATD_FLAG_SITUACAO = status;

      const res = await api.post(`v1/approvalofsales/sales/${empresaAtiva}/${usuarioAtivo}`, payload);

      const { data, sucess } = res.data;

      if (sucess) {
        alerta('Pedido alterado com sucesso!', 1);
        return data;
      }
    } catch (error) {
      alerta('Não foi possível alterar o status do pedido', 2);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDataTable = async (data) => {
    const aux = [];
    data.forEach((item) => {
      const pos = aux.findIndex((e) => e.USR_ID === item.USR_ID);

      if (pos !== -1) {
        aux[pos] = {
          ...item,
          ITEMS: [...aux[pos].ITEMS, item],
        };
      } else {
        aux.push({
          ...item,
          ITEMS: [item],
        });
      }
    });

    this.setState({ data: aux });
  };

  render() {
    const { loading, startDate, endDate, data, pageActive } = this.state;
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
            urlVoltar={'/home'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>event_note</Icon>Aprovação de pedidos
                </span>
              )
            }
          />
          <Linha style={{ alignItems: 'center', marginBottom: '0.5rem' }}>
            <DivDetalhe>
              <span style={{ paddingLeft: '10px', fontWeight: '700' }}>Data de cadastro</span>
              <DataFilter loading={loading ? 1 : 0} style={{ flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ paddingLeft: '10px' }}>Data incial</label>
                  <DatePicker
                    id="startDate"
                    selected={startDate}
                    onChange={this.onChangeStartDate}
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
                  <label style={{ paddingLeft: '10px' }}>Data final</label>
                  <DatePicker
                    selected={endDate}
                    onChange={this.onChangeEndDate}
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
            <DivDetalhe>
              <SaibRadioGroup
                valueItems={'"P","L","B"'}
                classNameItems={'"itemPendente","itemLiberados","itemBloqueados"'}
                textItems={'"Pendente","Liberados","Bloqueados"'}
                idItems={'"itemPendente","itemLiberados","itemBloqueados"'}
                classNameRadio="FiltroSituacaoPedido"
                flexDirectionRadio="row"
                disabledRadio="false"
                captionRadio="Status Pedido"
                defaultCheckedId={'itemPendente'}
                onChange={this.onChangeFiltroSituacaoEntrega}
              />
            </DivDetalhe>
            <DivDetalhe style={{ marginTop: '44px' }}>
              <Button className="waves-effect waves-light saib-button is-primary" onClick={this.onChangeFilter}>
                <FaFilter size={16} style={{ marginRight: '0.6rem' }} />
                Buscar
              </Button>
            </DivDetalhe>
          </Linha>
          <Table>
            <thead>
              <tr>
                <th>Nome</th>
                <th style={{ width: '160px' }}>Qtde. Pedidos</th>
                <th style={{ width: '130px', textAlign: 'center' }}>-</th>
              </tr>
            </thead>
            <tbody>
              {data.slice((pageActive - 1) * 15, 15 * pageActive).map((item, index) => (
                <tr
                  key={`${item.ATD_ID}_${item.ATD_COD_ATENDIMENTO}_${item.GEP_ID}_${index}`}
                  style={{
                    background: index % 2 === 0 ? '#ededed' : '#fff',
                  }}
                >
                  <td>
                    {item.USR_ID} - {item.USR_NOME}
                  </td>
                  <td
                    style={{
                      width: '160px',
                      fontWeight: '700',
                    }}
                  >
                    {item.ITEMS.length > 1 ? `${item.ITEMS.length} pedidos` : `${item.ITEMS.length} pedido`}
                  </td>
                  <td className="icons_table">
                      <Button
                        onClick={() => {
                          this.props.history.push({
                            pathname: '/EditOrderApprovalOfSales',
                            state: {
                              ITEMS: item.ITEMS
                            },
                          });
                        }}
                        title="Visualizar"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                        }}
                        className="waves-effect waves-light saib-button is-primary"
                      >
                        <IoMdEye size={18} />
                        Visualizar
                      </Button>
                    </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {data && data.length > 15 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '0.2rem',
                padding: '0 8px',
                marginTop: '1rem',
              }}
            >
              <Button
                className="waves-effect waves-light saib-button is-primary"
                disabled={pageActive === 1}
                onClick={() => this.setState({ pageActive: pageActive - 1 })}
              >
                Página anterior
              </Button>
              {/* <span style={{ fontWeight: '500', fontSize: '1rem' }}>{`Do ${(pageActive - 1) * 15} até ${15 * pageActive}`} items de {data.length}</span> */}
              <Button
                className="waves-effect waves-light saib-button is-primary"
                disabled={15 * pageActive > data.length}
                onClick={() => this.setState({ pageActive: pageActive + 1 })}
              >
                Próxima página
              </Button>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              margin: '0.5rem',
            }}
          >
            {(!data || (data && data.length === 0)) && (
              <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>Nenhum registro encontrado</span>
            )}
          </div>
        </Container>
      </>
    );
  }
}

export default ApprovalOfSales;
