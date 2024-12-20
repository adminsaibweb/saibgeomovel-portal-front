import React from 'react';
import { Container } from './styled';
import { IoIosBrush } from "react-icons/io";

export function PaymentsMethods({ data, onEdit }) {

  function handleEditMethod(item) {
    onEdit(item)
  }

  return (
    <>
      {data.map((item, index) => (
        <Container key={item.GPG_ID} style={{ borderTop: index !== 0 && "1px solid #d9d9d9", marginTop: index !== 0 && "0.5rem" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => handleEditMethod(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: '4px',
                background: '#843fa2',
                color: "#fff",
                borderRadius: "4px",
                border: "none",
                fontSize: "12px",
                fontWeight: "500"
              }}
            >
              <IoIosBrush size={14} color='#fff' />
              Editar
            </button>

            <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '4px',
              background: '#fff',
              color: item.GPG_FLG_ATIVO ? "#14532d" : "#ed3241",
              borderRadius: "4px",
              fontWeight: "700",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
            }}
            >
              {item.GPG_FLG_ATIVO ? 'Ativo' : 'Inativo'}
            </div>

            <span style={{ overflowWrap: "break-word", fontWeight: "500", color: "#000" }} >{item.GPG_CODIGO}</span>
            <span style={{ overflowWrap: "break-word", fontWeight: "400", color: "#666666" }} >{item.GPG_DESCRICAO}</span>
          </div>
        </Container>
      ))}
    </>
  );
}
