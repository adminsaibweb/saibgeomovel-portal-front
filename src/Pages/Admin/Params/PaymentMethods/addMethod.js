import React, { useState } from 'react';
import { Button, Checkbox, Icon } from 'react-materialize';
import SelectQuery from '../../../../Components/Globals/SelectQuery';
import api from '../../../../services/api';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import { alerta } from '../../../../services/funcoes';

export function AddMethod({ onClosed, onSaved, editFields }) {
  const [loading, setLoading] = useState(false);
  const [GPG_FLG_ATIVO, setGPG_FLG_ATIVO] = useState(editFields?.GPG_FLG_ATIVO || false);
  const [GPG_CODIGO, setGPG_CODIGO] = useState(editFields?.GPG_CODIGO || false);
  const [GPG_DESCRICAO, setGPG_DESCRICAO] = useState(editFields?.GPG_DESCRICAO || '');

  const listCod = [
    {
      id: '001',
      label: `A VISTA`,
    },
    {
      id: '002',
      label: `ENT +30 DIAS`,
    },
    {
      id: '003',
      label: `30/60/90 DIAS`,
    },
    {
      id: '004',
      label: `30/60/90/120`,
    },
    {
      id: '005',
      label: `60/90 DIAS`,
    },
    {
      id: '006',
      label: `CONSIGNADO`,
    },
    {
      id: '007',
      label: `30/60 DIAS`,
    },
  ];

  function onChangeStatus(e) {
    if (e.target.checked) {
      setGPG_FLG_ATIVO(1);
    } else {
      setGPG_FLG_ATIVO(0);
    }
  }

  function handleSelectCod(value) {
    if (value) {
      setGPG_CODIGO(value.id);
    } else {
      setGPG_CODIGO('');
    }
  }

  async function onSubmit() {
    try {
      setLoading(true);

      let payload = {
        GPG_FLG_ATIVO,
        GPG_CODIGO,
        GPG_DESCRICAO,
      };

      if (editFields) {
        payload = {
          ...payload,
          GPG_ID: editFields?.GPG_ID,
          GPG_QTDE_PARCELAS: editFields?.GPG_QTDE_PARCELAS,
          GPG_FPG_CUSTOM: editFields?.GPG_FPG_CUSTOM,
          GPG_INTERVALO_DIAS: editFields?.GPG_INTERVALO_DIAS,
        };
      }

      const res = await api.post(`v1/payments_conditions`, payload);

      const { sucess } = res.data;

      if (sucess) {
        alerta('Forma de pagamento criada com sucesso', 1);
        onSaved();
      }
    } catch (error) {
      if (error.response.data.error.includes("GPG_CODIGO_UNQ")) {
        alerta('Já existe uma forma de pagamento com esse código', 2);
      } else {
        alerta('Não foi possível criar a forma de pagamento');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form>
      <WaitScreen loading={loading} />
      <label>Código</label>
      <SelectQuery
        loading={false}
        itemSelected={GPG_CODIGO}
        colorPrimary
        query={listCod}
        keys={['label', 'id']}
        label="label"
        onSelect={handleSelectCod}
        onDelete={handleSelectCod}
      />
      <label>Descrição</label>
      <input
        type="text"
        value={GPG_DESCRICAO}
        onChange={(ev) => {
          setGPG_DESCRICAO(ev.target.value);
        }}
      />
      <Checkbox
        id="Checkbox_methodPayment"
        label={'Ativo'}
        value={String(GPG_FLG_ATIVO)}
        checked={GPG_FLG_ATIVO && GPG_FLG_ATIVO === 1 ? true : false}
        onClick={onChangeStatus}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '1rem', gap: '1rem' }}>
        <Button type="button" onClick={onSubmit} className="waves-effect waves-light saib-button is-primary">
          <Icon>save</Icon> Salvar
        </Button>
        <Button type="button" onClick={onClosed} className="waves-effect waves-light saib-button is-primary">
          <Icon>close</Icon> Cancelar
        </Button>
      </div>
    </form>
  );
}
