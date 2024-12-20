import React from 'react';

import { ButtonDelete, Card } from './styled';
import { format, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { IoMdTrash } from 'react-icons/io';

export function CardEvent({ data, handleDeleteEvent, pwa }) {
  function returnNivelsAcess(value) {
    const obj = {
      1: '1 - Promotor',
      2: '2 - Vendedor',
      3: '3 - Ambos',
    };

    return obj[value];
  }

  function checkDates(initial, final) {
    const inicio = startOfDay(parseISO(initial));
    const fim = startOfDay(parseISO(final));
    const today = startOfDay(new Date())

    return isWithinInterval(today, { start: inicio, end: fim });
  }

  return (
    <Card pwa={pwa}>
      <div>
        <span>Vigente</span>
        <span
          className="descriptionSpan"
          style={{
            fontWeight: '700',
            color: checkDates(data.GEV_DTA_INICIO, data.GEV_DTA_FIM) ? '#14532d' : '#ed3241',
          }}
        >
          {checkDates(data.GEV_DTA_INICIO, data.GEV_DTA_FIM) ? 'SIM' : 'NÃO'}
        </span>
      </div>
      <div>
        <span>Usuário</span>
        <span className="descriptionSpan">{data.USR_NOME}</span>
      </div>
      <div>
        <span>Tipo</span>
        <span className="descriptionSpan">{data.GEV_TIPO}</span>
      </div>
      {!pwa && (
        <>
          <div>
            <span>Data ínicio</span>
            <span className="descriptionSpan">{format(new Date(data.GEV_DTA_INICIO), 'dd/MM/yyyy')}</span>
          </div>
          <div>
            <span>Data fim</span>
            <span className="descriptionSpan">{format(new Date(data.GEV_DTA_FIM), 'dd/MM/yyyy')}</span>
          </div>
          <div>
            <span>Cliente</span>
            <span className="descriptionSpan">{`${data.CLI_CODIGO} - ${data.CLI_NOME_FANTASIA}`}</span>
          </div>
        </>
      )}
      <div>
        <span>Nível alerta</span>
        <span className="descriptionSpan">{data.GEV_NIVEL_ALERTA}</span>
      </div>
      <div>
        <span>Nível acesso</span>
        <span className="descriptionSpan">{returnNivelsAcess(data.GEV_ACESSO)}</span>
      </div>
      <div>
        <span>Documento</span>
        <span className="descriptionSpan">
          <a
            style={{ color: '#006ffd', width: '40px' }}
            target="_blank"
            rel="noopener noreferrer"
            className="descriptionSpan"
            href={data.GEV_DOCUMENTO}
          >
            {data.GEV_DOCUMENTO}
          </a>
        </span>
      </div>
      <div>
        <span>Descrição</span>
        <span className="description">{data.GEV_DESCRICAO || '-'}</span>
      </div>
      {!pwa && (
        <div>
          <ButtonDelete onClick={() => handleDeleteEvent(data.GEV_ID)}>
            <IoMdTrash size={18} />
            Excluir
          </ButtonDelete>
        </div>
      )}
    </Card>
  );
}
