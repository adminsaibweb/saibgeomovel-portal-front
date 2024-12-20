import React, { useEffect, useRef, useState } from 'react';
import { ContentNumDay, TopBar, ItemClient, ContentDays, ScheduleDesktop, ScheduleMobile, Popover } from './styled';
import { DivDetalhe } from '../../Globals/SaibCalendar/styled';
import { format } from 'date-fns';
import { add as addDaysWeekBar } from 'date-fns';
import { alerta, dateFormat } from '../../../services/funcoes';
import api from '../../../services/api';
import { getFromStorage } from '../../../services/auth';
import WaitScreen from '../../Globals/WaitScreen';
import { Button, Icon } from 'react-materialize';
import { IoIosAddCircle, IoIosMore, IoMdTrash } from 'react-icons/io';
import { SelectNewClient } from './SelectNewClient';

export default function WeekBar({
  data,
  schedule,
  lowerDate,
  handleTableRender,
  type,
  add,
  promotor,
  supervisor,
  flowsData,
}) {
  const [events, setEvents] = useState(data);
  const [loading, setLoading] = useState(false);
  const [lastModified, setLastModified] = useState([]);
  const [dates, setDates] = useState([]);
  const [currentDate, setCurrentDate] = useState(lowerDate || new Date());
  const [renderNewSchedule, setRenderNewSchedule] = useState(false);
  const currentValue = useRef(null);
  const dateNewCliente = useRef(null);

  const initialData = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const finalData = addDaysWeekBar(initialData, { days: 6 });

  const handleDragStart = (event, eventData) => {
    event.dataTransfer.setData('text/plain', JSON.stringify(eventData));
  };

  const handleDrop = async (event, date) => {
    let eventData = currentValue.current;
    if (event) {
      event.preventDefault();
      eventData = JSON.parse(event.dataTransfer.getData('text/plain'));
    }

    const existSameDay = events.filter(
      (e) => e.CLI_ID === eventData.CLI_ID && isSameDay(new Date(e.date), new Date(date))
    );

    if (existSameDay && existSameDay.length > 0) {
      alerta(`Já existe um agendamento para o cliente ${eventData.CLI_NOME_FANTASIA} no dia selecionado`, 2);
      return;
    }

    if (!isSameDay(new Date(eventData.DATE), date)) {
      const res = await handleManipulaClientsNewAppointment(eventData.CLI_ID, eventData.CLI_NOME_FANTASIA, date);

      if (!res) {
        return;
      }
    }

    setLastModified([...lastModified, eventData.id]);
    setDates([...dates, new Date(eventData.DATE), date]);

    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((e) => {
        if (e.id === eventData.id) {
          return { ...e, date };
        }
        return e;
      });
      return updatedEvents;
    });
    const popover = document.getElementById('popoverContent');
    const popoverDesktop = document.getElementById('popoverContentDesktop');
    popover.style.display = 'none';
    popoverDesktop.style.display = 'none';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const renderWeekView = () => {
    const weekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekStart.getTime() + i * 86400000);
          const eventsOnDate = events.filter((event) => isSameDay(event.date, date));

          return (
            <div key={i} style={{ background: '#fff' }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, date)}>
              <div
                style={{
                  background: '#d5b5e3',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 2px',
                  boxShadow: '#eee1f4 0px 30px 60px -12px inset, #000 0px 18px 36px -18px inset',
                  borderLeftWidth: '0.5px',
                  borderRightWidth: '0.5px',
                  borderColor: '#bf8fd6',
                  borderStyle: 'solid',
                }}
              >
                <ContentDays>
                  <p>{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                  <ContentNumDay clicked={currentDate.getDate() === date.getDate()}>{date.getDate()}</ContentNumDay>
                </ContentDays>
              </div>
              <div style={{ border: '1px solid #8e44ad', height: '100%' }}>
                {eventsOnDate.map((event) => (
                  <ItemClient
                    lastModified={lastModified.find((ele) => ele === event.id)}
                    key={event.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      {event.CLI_NOME_FANTASIA}

                      <button
                        title="Mover"
                        id={`popoverButtonDesktop${event.id}`}
                        onClick={() => handlePopoverDesktop(`popoverButtonDesktop${event.id}`, event)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          color: '#8E44AD',
                          background: '#fff',
                          borderRadius: '4px',
                          width: '20px',
                          height: '20px',
                          border: 'none',
                        }}
                      >
                        <IoIosMore size={20} />
                      </button>
                    </div>
                    <p>{event.CLI_RAZAO_SOCIAL}</p>
                  </ItemClient>
                ))}
                {add && (
                  <button
                    onClick={() => {
                      dateNewCliente.current = date;
                      setRenderNewSchedule(true);
                    }}
                    title="Adicionar"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#fff',
                      background: '#bf1f7c',
                      borderRadius: '4px',
                      width: '97%',
                      height: '30px',
                      border: 'none',
                      gap: '0.2rem',
                      padding: '0.2rem',
                      margin: '0.15rem',
                    }}
                  >
                    <IoIosAddCircle size={30} />
                    Adicionar
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <Popover id="popoverContentDesktop">
          <button
            title="Excluir"
            onClick={handleRemoveClient}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              background: 'red',
              borderRadius: '4px',
              width: '100%',
              border: 'none',
              padding: '0.6rem 0.2rem',
              gap: '0.2rem',
            }}
          >
            <IoMdTrash size={20} />
            Excluir
          </button>
          <span style={{ width: '100%', borderBottom: '1px solid #c3c3c3', fontWeight: '700', fontSize: '14px' }}>
            Mover para
          </span>
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date(weekStart.getTime() + i * 86400000);

            return (
              <div key={date.toLocaleDateString('pt-BR', { weekday: 'long' })}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#000',
                    background: '#fff',
                    fontWeight: '600',
                    borderRadius: '4px',
                    border: 'none',
                    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 19px 38px, rgba(0, 0, 0, 0.15) 0px 15px 12px',
                    padding: '0.6rem 0.2rem',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '6px',
                  }}
                  onClick={() => handleDrop(null, date)}
                >
                  Dia {date.getDate()} - {date.toLocaleDateString('pt-BR', { weekday: 'long' })}
                </button>
              </div>
            );
          })}
        </Popover>
      </div>
    );
  };

  const renderWeekMobile = () => {
    const weekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekStart.getTime() + i * 86400000);
          const eventsOnDate = events.filter((event) => isSameDay(event.date, date));

          return (
            <div key={i} style={{ background: '#fff' }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, date)}>
              <div
                style={{
                  background: '#d5b5e3',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 2px',
                  boxShadow: '#eee1f4 0px 30px 60px -12px inset, #000 0px 18px 36px -18px inset',
                }}
              >
                <ContentDays>
                  <p>{date.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                  <ContentNumDay clicked={currentDate.getDate() === date.getDate()}>{date.getDate()}</ContentNumDay>
                </ContentDays>
              </div>
              <div style={{ border: '1px solid #8e44ad', height: '100%' }}>
                {eventsOnDate.map((event) => (
                  <ItemClient
                    lastModified={lastModified.find((ele) => ele === event.id)}
                    key={event.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      {event.CLI_NOME_FANTASIA}

                      <button
                        id={`popoverButton${event.id}`}
                        onClick={() => handlePopover(`popoverButton${event.id}`, event)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          color: '#8E44AD',
                          background: '#fff',
                          borderRadius: '4px',
                          width: '24px',
                          height: '24px',
                          border: 'none',
                        }}
                      >
                        <IoIosMore size={24} />
                      </button>
                    </div>
                    <p>{event.CLI_RAZAO_SOCIAL}</p>
                  </ItemClient>
                ))}
                {add && (
                  <button
                    onClick={() => {
                      dateNewCliente.current = date;
                      setRenderNewSchedule(true);
                    }}
                    title="Adicionar"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#fff',
                      background: '#bf1f7c',
                      borderRadius: '4px',
                      width: '97%',
                      height: '30px',
                      border: 'none',
                      gap: '0.2rem',
                      padding: '0.2rem',
                      margin: '0.15rem',
                    }}
                  >
                    <IoIosAddCircle size={30} />
                    Adicionar
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <Popover id="popoverContent">
          <button
            title="Excluir"
            onClick={handleRemoveClient}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              background: 'red',
              borderRadius: '4px',
              width: '100%',
              border: 'none',
              padding: '0.6rem 0.2rem',
              gap: '0.2rem',
            }}
          >
            <IoMdTrash size={20} />
            Excluir
          </button>
          <span style={{ width: '100%', borderBottom: '1px solid #c3c3c3', fontWeight: '700', fontSize: '14px' }}>
            Mover para
          </span>
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date(weekStart.getTime() + i * 86400000);

            return (
              <div key={date.toLocaleDateString('pt-BR', { weekday: 'long' })}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#000',
                    background: '#fff',
                    fontWeight: '600',
                    borderRadius: '4px',
                    border: 'none',
                    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 19px 38px, rgba(0, 0, 0, 0.15) 0px 15px 12px',
                    padding: '0.6rem 0.2rem',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '6px',
                  }}
                  onClick={() => handleDrop(null, date)}
                >
                  Dia {date.getDate()} - {date.toLocaleDateString('pt-BR', { weekday: 'long' })}
                </button>
              </div>
            );
          })}
        </Popover>
      </div>
    );
  };

  const handlePopover = (id, event) => {
    var button = document.getElementById(id);
    var popover = document.getElementById('popoverContent');

    currentValue.current = event;

    if (popover.style.display === 'none' || popover.style.display === '') {
      var rect = button.getBoundingClientRect();
      popover.style.top = rect.bottom + window.scrollY + 'px';
      popover.style.left = rect.left - window.scrollX - 180 + 'px';
      popover.style.display = 'block';
    } else {
      popover.style.display = 'none';
    }
  };

  const handlePopoverDesktop = (id, event) => {
    var button = document.getElementById(id);
    var popover = document.getElementById('popoverContentDesktop');

    currentValue.current = event;

    if (popover.style.display === 'none' || popover.style.display === '') {
      var rect = button.getBoundingClientRect();
      popover.style.top = rect.bottom + window.scrollY + 'px';
      popover.style.left = rect.left - window.scrollX - 180 + 'px';
      popover.style.display = 'block';
    } else {
      popover.style.display = 'none';
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleRemoveClient = () => {
    setDates([...dates, currentValue.current.date]);
    setEvents(events.filter((event) => event.id !== currentValue.current.id));
    setLastModified([...lastModified, currentValue.current.id]);
    const popover = document.getElementById('popoverContent');
    const popoverDesktop = document.getElementById('popoverContentDesktop');
    popover.style.display = 'none';
    popoverDesktop.style.display = 'none';
  };

  const handleManipulaClientsNewAppointment = async (id, name, daySelected) => {
    try {
      const sessao = getFromStorage();

      const empresaAtiva = sessao.empresaId;
      const usuarioAtivo = sessao.codigoUsuario;
      setLoading(true);

      if (id) {
        let url;
        url = '/v1/schedule/' + empresaAtiva + '/' + usuarioAtivo;
        let data = {
          dataInicial: dateFormat(daySelected, 'DD/MM/yyyy'),
          dataFinal: dateFormat(daySelected, 'DD/MM/yyyy'),
          usuarioAgenda: '',
          status: 1,
          clienteId: id,
        };
        const res = await api.post(url, data);

        if (res.data && res.data.sucess) {
          if (res.data.data.length > 0) {
            alerta(`Já existe um agendamento para o cliente ${name} no dia selecionado`, 2);
            return false;
          } else {
            return true;
          }
        }
      }
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    let array = [];
    const sessao = getFromStorage();
    let flagSuccess = true;

    const empresaAtiva = sessao.empresaId;
    const usuarioAtivo = sessao.codigoUsuario;
    setLoading(true);
    dates.forEach((ele) => {
      schedule.forEach((item) => {
        const partes = item.GAA_DTA_AGENDA.split('/');
        const data = new Date(partes[2], partes[1] - 1, partes[0]);

        if (isSameDay(ele, data)) {
          item.DATE = data;
          array.push(item);
        }
      });
    });

    for (const e of dates) {
      const clients = events.filter((event) => isSameDay(event.date, e));

      try {
        const clientsData = clients.map((cli) => {
          return {
            CLI_CODIGO: cli.CLI_CODIGO,
            CLI_ID: cli.CLI_ID,
            CLI_RAZAO_SOCIAL: cli.CLI_RAZAO_SOCIAL,
            CLI_NOME_FANTASIA: cli.CLI_NOME_FANTASIA.split('- ')[1]
              ? cli.CLI_NOME_FANTASIA.split('- ')[1].split(' (')[0]
              : cli.CLI_NOME_FANTASIA,
          };
        });

        const exist = array.find((mod) => isSameDay(mod.DATE, e));

        if (exist) {
          const reqData = {
            gaaId: exist.GAA_ID,
            diaSelecionado: exist.GAA_DTA_AGENDA,
            fluxo: exist.GAA_GAF_ID,
            supervisor: type === 1 ? exist.GAA_USR_ID_AGENDA : '',
            promotor: type === 2 ? exist.GAA_USR_ID_AGENDA : '',
            scheduleType: exist.TIPO,
            scheduleActive: 1,
            clientes: clientsData,
          };

          if (clientsData.length === 0) {
            await api.delete(`/v1/schedule/${empresaAtiva}/${usuarioAtivo}/${exist.GAA_ID}`);
          } else {
            await api.put(`/v1/schedule/${empresaAtiva}/${usuarioAtivo}`, reqData);
          }
        } else {
          const payloadCreate = {
            scheduleType:
              schedule && schedule.length > 0 ? schedule[0].TIPO : type === 1 ? supervisor.USR_TIPO : promotor.USR_TIPO,
            clientes: clientsData,
            supervisor:
              type === 1 ? (schedule && schedule.length > 0 ? schedule[0].GAA_USR_ID_AGENDA : supervisor) : '',
            promotor: type === 2 ? (schedule && schedule.length > 0 ? schedule[0].GAA_USR_ID_AGENDA : promotor) : '',
            fluxo: schedule && schedule.length > 0 ? schedule[0].GAA_GAF_ID : clients[0].fluxo,
            diaSelecionado: format(e, 'dd/MM/yyyy'),
            scheduleActive: 1,
          };

          let url = '/v1/schedule/add/' + empresaAtiva + '/' + usuarioAtivo;
          await api.post(url, payloadCreate);
        }
      } catch (e) {
        flagSuccess = false;
        alerta('Erro ao alterar agenda', 2);
      }
    }
    if (flagSuccess) {
      setLastModified([]);
      setDates([]);
      alerta('Agenda alterada com sucesso!', 1);
    }

    setLoading(false);
  };

  const handleAddNewCliente = async (client, fluxo) => {
    setLoading(true);
    const res = await handleManipulaClientsNewAppointment(
      client.CLI_ID,
      client.CLI_NOME_FANTASIA,
      dateNewCliente.current
    );
    if (res) {
      client.date = dateNewCliente.current;
      client.DATE = dateNewCliente.current;
      client.id = `${dateNewCliente.current}_${client.CLI_ID}`;
      client.fluxo = flowsData.length === 1 ? flowsData[0].GAF_ID : fluxo;
      setEvents([...events, client]);
      setDates([...dates, dateNewCliente.current]);
      setLastModified([...lastModified, client.CLI_ID]);
      alerta('Cliente adicionado com sucesso', 1);
      dateNewCliente.current = null;
    }
    setLoading(false);
  };

  useEffect(() => {
    setEvents(data);
    setLastModified([]);
    setDates([]);
    if (lowerDate) {
      setCurrentDate(lowerDate)
    }
  }, [data, lowerDate]);

  return (
    <>
      <WaitScreen loading={loading} />
      {(promotor || supervisor) && (
        <TopBar>
          <DivDetalhe>
            <div className="contentIcons">
              {lastModified && lastModified.length === 0 && (
                <div
                  className="prev"
                  onClick={() => {
                    const initial = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      currentDate.getDate() - 7
                    );
                    setCurrentDate(initial);
                    handleTableRender(initial);
                  }}
                >
                  <Icon>navigate_before</Icon>
                </div>
              )}
              <div className="date">
                <p>{format(initialData, 'dd/MM/yyyy')}</p>
                <p>até {format(finalData, 'dd/MM/yyyy')}</p>
              </div>
              {lastModified && lastModified.length === 0 && (
                <div
                  className="next"
                  onClick={() => {
                    const final = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      currentDate.getDate() + 7
                    );
                    setCurrentDate(final);
                    handleTableRender(final);
                  }}
                >
                  <Icon>keyboard_arrow_right</Icon>
                </div>
              )}
            </div>
          </DivDetalhe>
          {lastModified && lastModified.length > 0 && (
            <Button
              className="waves-effect waves-light saib-button is-primary"
              style={{ padding: '10px' }}
              onClick={handleSaveSchedule}
            >
              <Icon>save</Icon>
              Salvar agenda
            </Button>
          )}
        </TopBar>
      )}

      <ScheduleDesktop>{renderWeekView()}</ScheduleDesktop>
      <ScheduleMobile>{renderWeekMobile()}</ScheduleMobile>

      {renderNewSchedule && (
        <SelectNewClient
          open={renderNewSchedule}
          closeModal={() => setRenderNewSchedule(false)}
          resultSearch={(res, fluxo) => {
            setRenderNewSchedule(false);
            handleAddNewCliente(res, fluxo);
          }}
          flowsData={schedule && schedule.length === 0 && flowsData && flowsData.length > 1 ? flowsData : false}
        />
      )}
    </>
  );
}
