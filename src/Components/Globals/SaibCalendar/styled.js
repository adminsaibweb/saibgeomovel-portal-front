import styled from 'styled-components';

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  > div {
    display: flex;
  }

  .date {
    display: flex;
    p {
      padding-right: 5px;
      font-weight: 500;
      font-size: 1.1rem;
    }
  }

  div.contentIcons {
    display: flex;

    i {
      cursor: pointer;
    }
  }

  div.prev {
    margin-right: 5px;
  }
  div.next {
    margin-left: 5px;
  }

  select {
    display: block;
  }
`;

export const Container = styled.div`
  margin: 0 10px;
  flex: 1;
`;

export const DivDetalhe = styled.div`
  padding: 5px 0;
  select {
    margin: 0;
    height: 2.5rem;
  }
`;
