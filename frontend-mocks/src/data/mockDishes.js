export const mockDishes = [
  {
    id: '1',
    name: 'Kotlet schabowy',
    description: 'Tradycyjny kotlet schabowy z ziemniakami i surówką z kapusty',
    category: 'Danie główne',
    imageUrl: 'https://pliki.doradcasmaku.pl/kotlet-schabowy-w-smietanie0-4',
    averageRating: 4.2,
    comments: [
      {
        id: 'c1',
        text: 'Bardzo smaczny, ale mógłby być bardziej chrupiący.',
        date: '2023-11-02T12:30:00',
        user: {
          name: 'Jan Kowalski',
          avatar: 'https://v.wpimg.pl/eXkwLmpwSjkKFTpeXwxHLElNbgQZVUl6HlV2T19BU2ETR2MdHwUROQdaLQ8TDQEqBAAlCF4AFTsPGWIdHFgMNQoQKS4RFA09REV8X0FYVW5ERXxCAAUKMg4cOEASEh91Hw44GBwCSGs0QnxeFllIIFsOfBUIRxwhW1kmHRdVGA'
        },
        status: 'APPROVED'
      },
      {
        id: 'c2',
        text: 'Porcja mogłaby być większa, ale smak super!',
        date: '2023-11-02T13:15:00',
        user: {
          name: 'Anna Nowak',
          avatar: 'https://previews.123rf.com/images/stockbroker/stockbroker1408/stockbroker140802621/31052570-portret-%C5%82adna-dziewczyna-w-wie%C5%9B.jpg'
        },
        status: 'APPROVED'
      }
    ]
  },
  {
    id: '2',
    name: 'Zupa pomidorowa',
    description: 'Domowa zupa pomidorowa z ryżem i świeżymi ziołami',
    category: 'Zupa',
    imageUrl: 'https://img.wprost.pl/img/wysmienita-zupa-pomidorowa-ze-swiezych-pomidorow-z-tego-przepisu-przygotowywala-ja-moja-babcia/1f/1a/c69122a80c37084cbe83608f4120.webp',
    averageRating: 4.5,
    comments: [
      {
        id: 'c3',
        text: 'Najlepsza zupa pomidorowa jaką jadłem w stołówce!',
        date: '2023-11-02T12:45:00',
        user: {
          name: 'Piotr Wiśniewski',
          avatar: 'https://v.wpimg.pl/eXkwLmpwSjkKFTpeXwxHLElNbgQZVUl6HlV2T19BU2ETR2MdHwUROQdaLQ8TDQEqBAAlCF4AFTsPGWIdHFgMNQoQKS4RFA09REV8X0FYVW5ERXxCAAUKMg4cOEASEh91Hw44GBwCSGs0QnxeFllIIFsOfBUIRxwhW1kmHRdVGA'
        },
        status: 'APPROVED'
      },
      {
        id: 'c4',
        text: 'Trochę za mało ryżu, ale smak rewelacyjny.',
        date: '2023-11-02T14:00:00',
        user: {
          name: 'Katarzyna Lewandowska',
          avatar: 'https://via.placeholder.com/40'
        },
        status: 'PENDING'
      }
    ]
  },
  {
    id: '3',
    name: 'Pierogi ruskie',
    description: 'Pierogi z nadzieniem z ziemniaków i twarogu, podawane z cebulką',
    category: 'Danie główne',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Pierogi_ruskie.jpg',
    averageRating: 4.8,
    comments: [
      {
        id: 'c5',
        text: 'Przepyszne! Ciasto idealnie miękkie, a nadzienie dobrze przyprawione.',
        date: '2023-11-03T12:30:00',
        user: {
          name: 'Magdalena Kowalczyk',
          avatar: 'https://via.placeholder.com/40'
        },
        status: 'APPROVED'
      }
    ]
  },
  {
    id: '4',
    name: 'Surówka z marchewki',
    description: 'Świeża surówka z marchewki z dodatkiem jabłka i rodzynek',
    category: 'Dodatek',
    imageUrl: 'https://img.wprost.pl/img/surowke-z-marchewki-robie-inaczej-niz-wszyscy-dodaje-do-niej-2-aromatyczne-skladniki/e1/0a/e94544d85bf9eae22bb31cd9402f.webp',
    averageRating: 3.9,
    comments: []
  },
  {
    id: '5',
    name: 'Kompot owocowy',
    description: 'Kompot z sezonowych owoców',
    category: 'Napój',
    imageUrl: 'https://www.przyslijprzepis.pl/media/cache/big/uploads/media/recipe/0004/80/afb398b5903c5eb7534bda23d7b16603808cf77d.jpeg',
    averageRating: 4.0,
    comments: []
  },
  {
    id: '6',
    name: 'Naleśniki z serem',
    description: 'Naleśniki z nadzieniem z sera twarogowego i rodzynkami, polane sosem jogurtowym',
    category: 'Deser',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Nalesniki_z_serem.jpg',
    averageRating: 4.7,
    comments: [
      {
        id: 'c6',
        text: 'Pyszne! Mogłyby być częściej w menu.',
        date: '2023-11-04T13:00:00',
        user: {
          name: 'Tomasz Nowicki',
          avatar: 'https://via.placeholder.com/40'
        },
        status: 'APPROVED'
      }
    ]
  },
  {
    id: '7',
    name: 'Gulasz wołowy',
    description: 'Gulasz z wołowiny z warzywami, podawany z kaszą gryczaną',
    category: 'Danie główne',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Gulasz.jpg',
    averageRating: 4.3,
    comments: []
  },
  {
    id: '8',
    name: 'Rosół z makaronem',
    description: 'Tradycyjny rosół z kurczaka z domowym makaronem i natką pietruszki',
    category: 'Zupa',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Rosol.jpg',
    averageRating: 4.6,
    comments: []
  }
];
