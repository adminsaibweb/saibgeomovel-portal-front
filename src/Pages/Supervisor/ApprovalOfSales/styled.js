import styled from 'styled-components';

export const Table = styled.table`
  width: 99%;
  margin-left: 10px;

  thead {
    tr {
      th {
        position: sticky;
        border-left-width: 1px;
        border-right-width: 1px;
        border-color: #fff;
        border-style: solid;
        text-align: left;
        padding: 6px 4px;
        background: #8e44ad;
        color: #fff;
      }
    }
  }

  tbody {
    tr {
      border-bottom-width: 1px;
      border-color: #cccccc;

      td {
        padding: 2px !important;
        font-weight: bold;
        text-align: left;
      }

      td.icons_table {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.2rem;
        width: 130px;
        padding-right: 10px !important;
      }
    }
  }
`;

export const CardOrder = styled.div`
  display: flex;
  flex-direction: column;

  width: 300px;
  height: max-content;
  flex-grow: 1;
  box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px,
    rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid;
  border-color: ${(props) => (props.typeOrder === "true" ? '#a057c1' : 'rgba(0, 0, 0, 0.2)')};

  background: ${(props) => (props.typeOrder === "true" ? '#f5ecf8' : '#fff')};

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 5px;
  }
`;

export const ButtonCheck = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin: 0.3rem 0;
  width: 100%;
  cursor: pointer;

  background: #14532d;
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;

  padding: 0.3rem 0.5rem;
  border-radius: 100px;
  border: none;
  transition: all 0.2s linear;

  &:hover {
    background: #175e33;
  }
`;
export const ButtonDenied = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin: 0.3rem 0;
  width: 100%;
  cursor: pointer;

  background: #ed3241;
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;

  padding: 0.3rem 0.5rem;
  border-radius: 100px;
  border: none;
  transition: all 0.2s linear;

  &:hover {
    background: #f15b67;
  }

  > svg {
    border-color: none !important;
    border-style: none !important;
    border-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  > i {
    border-color: none !important;
    border-style: none !important;
    border-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;

    svg {
      border-color: none !important;
      border-style: none !important;
      border-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  }
`;

export const DialogOptions = styled.div`
  position: fixed;
  left: 0;
  top: 0;

  background: rgb(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;

  height: 100%;
  width: 100%;
  z-index: 9999;
`;

export const DialogContent = styled.div`
  z-index: 9999;
  display: flex;
  width: 97%;
  flex-direction: column;
  gap: 1.2rem;
  background: #fff;
  padding: 0.6rem;
  border-radius: 4px;

  > h2 {
    font-size: 1.4rem;
    font-weight: 600;
    color: #8e44ad;
    margin: 0;
  }
`;

export const ContainerCollapsibleAndBtns = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ContentCollapsible = styled.div`
  width: 100%;
  .collapsible-header {
    background-color: ${(props) => (props.type === "true" ? '#8e44ad' : '#523FBA')};
    padding-bottom: 5px;
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    align-items: center;
    gap: 0.2rem;
    border-radius: 5px;
    margin: 0 !important;
  }
`;

export const TextAreaDiv = styled.div`
  textarea {
    position: relative;
    resize: none;
    height: 4rem;
    padding: 5px;
    border: none;
    border: 1px solid #b3b3b3;
    margin: 2px;
    color: #000;
    box-shadow: 400;
    font-size: 1.2rem;
  }
`
