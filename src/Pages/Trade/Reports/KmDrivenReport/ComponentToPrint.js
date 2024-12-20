import React, { forwardRef } from 'react';

import Logo from '../../../../assets/images/saibGeoLogoLogin.png';
import { format } from 'date-fns';
import { formatDateTimeToBr } from '../../../../services/funcoes';
import { DivImg } from './styled';

export const ComponentToPrint = forwardRef((props, ref) => {

  return (
    <div ref={ref}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #000',
          padding: '12px 0',
        }}
      >
        <div>
          <img src={Logo} width={150} alt="logo" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontWeight: '700', fontSize: '1.2rem', textAlign: 'center' }}>Relatório de KM rodados</p>

          {props.dataCompany && (
            <p style={{ textAlign: 'center' }}>
              {`${props.dataCompany.codigoEmpresa} - ${props.dataCompany.empresaNomeFantasia
                .toLowerCase()
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')}
              `}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {props.dataCompany && (
            <p style={{ fontWeight: '500', fontSize: '0.8rem' }}>
              USUÁRIO: {props.dataCompany.codigoUsuario} - {props.dataCompany.nomeUsuario}
            </p>
          )}
          <p style={{ fontWeight: '500', fontSize: '0.8rem' }}>DATA: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        </div>
      </header>

      <span style={{ fontWeight: '700', fontSize: '1rem' }}>
        {`De ${formatDateTimeToBr(props.dateInitial, 'DD/MM/YYYY')} à ${formatDateTimeToBr(props.dateFinal, 'DD/MM/YYYY')}`}
      </span>
      {props.imagesEnable &&
        props.data?.data?.map((item, index) => (
          <div
            key={`${item.USR_ID}_${index}`}
            style={{
              width: '100%',
              marginBottom: '16px',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: '100%',
                background: '#e6e6e6',
                marginBottom: '8px',
              }}
            >
              <p
                style={{
                  textAlign: 'left',
                  color: '#000',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  marginLeft: '4px',
                }}
              >
                {item.USR_NOME} - {formatDateTimeToBr(item.GKM_DATA, 'DD/MM/YYYY')}
              </p>
            </div>
            {item.GKM_DTA_CHECKIN && (
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}
              >
                <p>
                  <strong>Data checkin:&nbsp;</strong>
                  {formatDateTimeToBr(item.GKM_DTA_CHECKIN)}
                </p>
                <p>
                  <strong>Data checkout:&nbsp;</strong>
                  {formatDateTimeToBr(item.GKM_DTA_CHECKOUT)}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <p>
                <strong style={{ fontWeight: '900' }}>Data início:&nbsp;</strong>
                {formatDateTimeToBr(item.GKM_KM_INICIAL_DATA)}
              </p>
              <p>
                <strong style={{ fontWeight: '900' }}>Data fim:&nbsp;</strong>
                {formatDateTimeToBr(item.GKM_KM_FINAL_DATA)}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <p>
                <strong style={{ fontWeight: '900' }}>Coordenadas iniciais:&nbsp;</strong>
                {`${item.GKM_KM_INICIAL_LATITUDE},${item.GKM_KM_INICIAL_LONGITUDE}`}
              </p>
              <p>
                <strong style={{ fontWeight: '900' }}>Coordenadas finais:&nbsp;</strong>
                {`${item.GKM_KM_FINAL_LATITUDE},${item.GKM_KM_FINAL_LONGITUDE}`}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <p>
                <strong style={{ fontWeight: '900' }}>KM inicial:&nbsp;</strong>
                {item.GKM_KM_INICIAL || 'Não informado'}
              </p>
              <p>
                <strong style={{ fontWeight: '900' }}>KM final:&nbsp;</strong>
                {item.GKM_KM_FINAL || 'Não informado'}
              </p>
            </div>
            {item.GKM_KM_FINAL && (
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}
              >
                <p>
                  <strong style={{ fontWeight: '900' }}>KM/DIA:&nbsp;</strong>
                  {item.GKM_KM_FINAL - item.GKM_KM_INICIAL}
                </p>
              </div>
            )}
            {props.imagesEnable && (
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}
              >
                {item.GKM_KM_INICIAL_FOTO && (
                  <DivImg>
                    <img src={item.GKM_KM_INICIAL_FOTO} alt="Foto inicial" />
                    <strong style={{ fontWeight: '900', background: '#ebebeb' }}>FOTO INICIO DIA</strong>
                  </DivImg>
                )}

                {item.GKM_KM_FINAL_FOTO && (
                  <DivImg>
                    <img src={item.GKM_KM_FINAL_FOTO} alt="Foto final" />
                    <strong style={{ fontWeight: '900', background: '#ebebeb' }}>FOTO FIM DIA</strong>
                  </DivImg>
                )}
              </div>
            )}
          </div>
        ))}

      <div
        style={{
          width: '100%',
          marginBottom: '4px',
          marginTop: '4px',
          borderBottom: '1px solid #a6a6a6',
        }}
      />

      {props.imagesEnable &&
        props.data?.summary?.map((item, index) => (
          <div
            key={`${item.GKM_USR_ID}_${index}`}
            style={{
              width: '100%',
              marginBottom: '16px',
              marginTop: '8px',
              borderBottom: '1px solid #a6a6a6',
            }}
          >
            <div
              style={{
                width: '100%',
                background: '#e6e6e6',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <p
                style={{
                  textAlign: 'left',
                  color: '#000',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  marginLeft: '4px',
                }}
              >
                {item.USR_NOME}
              </p>
              <p style={{ fontSize: '0.8rem' }}>
                KM RODADOS:&nbsp;
                <strong style={{ fontWeight: '900', background: '#ebebeb', color: '#000' }}>{item.GKM_KM_TOTAL}</strong>
              </p>
            </div>
          </div>
        ))}

      {!props.imagesEnable && (
        <>
          <table>
            <thead>
              <tr style={{ background: '#8e44ad' }}>
                <th
                  style={{
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    border: '1px solid #fff',
                    padding: '0.4rem 0.1rem',
                    color: '#fff',
                  }}
                >
                  DATA
                </th>
                <th
                  style={{
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    border: '1px solid #fff',
                    padding: '0.4rem 0.1rem',
                    color: '#fff',
                  }}
                >
                  MATRÍCULA
                </th>
                <th
                  style={{
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    border: '1px solid #fff',
                    padding: '0.4rem 0.1rem',
                    color: '#fff',
                  }}
                >
                  COLABORADOR
                </th>
                <th
                  style={{
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    border: '1px solid #fff',
                    padding: '0.4rem 0.1rem',
                    color: '#fff',
                  }}
                >
                  KM INICIAL
                </th>
                <th
                  style={{
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    border: '1px solid #fff',
                    padding: '0.4rem 0.1rem',
                    color: '#fff',
                  }}
                >
                  KM FINAL
                </th>
                <th
                  style={{
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    border: '1px solid #fff',
                    padding: '0.4rem 0.1rem',
                    color: '#fff',
                  }}
                >
                  KM/DIA
                </th>
              </tr>
            </thead>
            <tbody>
              {props.data?.data?.map((item, index) => (
                <tr
                  style={{
                    background: index % 2 === 0 ? '#ebebeb' : '#d9d9d9',
                    color: '#000',
                    padding: '0.5rem 0.1rem',
                  }}
                  key={index}
                >
                  <td style={{ fontSize: '0.8rem', textAlign: 'left' }}>{item.DATA}</td>
                  <td style={{ fontSize: '0.8rem', textAlign: 'left' }}>{item.MATRICULA}</td>
                  <td style={{ fontSize: '0.8rem', textAlign: 'left' }}>{item.COLABORADOR}</td>
                  <td style={{ fontSize: '0.8rem', textAlign: 'left', fontWeight: '800' }}>{item.KM_INICIAL}</td>
                  <td style={{ fontSize: '0.8rem', textAlign: 'left', fontWeight: '800' }}>{item.KM_FINAL}</td>
                  <td style={{ fontSize: '0.8rem', textAlign: 'left', fontWeight: '800' }}>{item.KM_DIA}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <span style={{ fontWeight: '700', fontSize: '1rem', marginTop: '2rem' }}>RESUMO</span>
          <table>
            <thead>
              <tr style={{ background: '#8e44ad' }}>
                <th
                  style={{
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    border: '1px solid #fff',
                    padding: '0.4rem 0.1rem',
                    color: '#fff',
                  }}
                >
                  MATRÍCULA
                </th>
                <th
                  style={{
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    border: '1px solid #fff',
                    padding: '0.4rem 0.1rem',
                    color: '#fff',
                  }}
                >
                  COLABORADOR
                </th>
                <th
                  style={{
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    border: '1px solid #fff',
                    padding: '0.4rem 0.1rem',
                    color: '#fff',
                  }}
                >
                  KM TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {props.data?.summary?.map((item, index) => (
                <tr
                  style={{
                    background: index % 2 === 0 ? '#ebebeb' : '#d9d9d9',
                    color: '#000',
                    padding: '0.5rem 0.1rem',
                  }}
                  key={index}
                >
                  <td style={{ fontSize: '0.8rem', textAlign: 'left' }}>{item.USR_ID}</td>
                  <td style={{ fontSize: '0.8rem', textAlign: 'left' }}>
                    {item.USR_ID} - {item.USR_NOME}
                  </td>
                  <td style={{ fontSize: '0.8rem', textAlign: 'left', fontWeight: '800' }}>{item.GKM_KM_TOTAL}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
});

ComponentToPrint.displayName = 'ComponentToPrint';
