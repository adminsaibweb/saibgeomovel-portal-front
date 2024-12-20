import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  /* flex-wrap: wrap; */
  width: 100%;
  height: 100%;

  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;

  padding: 5px 10px;
`;

export const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.align ? props.align : 'center')};
`;

export const PTitle = styled.p`
  font-weight: 500;
  padding-left: ${(props) => props.withPaddingLeft && '5px'};
`;

export const PData = styled.p`
  font-weight: 500;
  color: #858585;

  padding-left: ${(props) => props.withPaddingLeft && '5px'};
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 15rem;
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;

  margin-top: ${(props) => (props.withMarginTop ? '5px !important' : '0')};

  button.mapButton {
    padding: 12px !important;
    height: 2rem !important;
    width: 2rem !important;
  }
`;

export const HeaderCollapsible = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  padding: 0.2rem 0.4rem;
  color: #bf1f7c;
  border: 1px solid #bf1f7c;
  border-radius: 3px;
`

export const ContentCollapsible = styled.div`
  width: 100%;
`