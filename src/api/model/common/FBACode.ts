import { keyBy } from 'lodash-es';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { AddressType } from '@/api/model/common/AddressType';

interface FBAAddress {
  code: string;
  state: string;
  address: string;
  postCode: string;
  countryCode: string;
}
const fbaCode: FBAAddress[] = [
  {
    code: 'CZ-PRG2',
    state: 'Dobrovíz',
    address: 'K Amazonu 235',
    postCode: '252 61',
    countryCode: 'CZ',
  },
  {
    code: 'EDE5',
    state: 'Werne',
    address: 'Werne Wahrbrink 23 59368 Werne',
    postCode: '59368',
    countryCode: 'DE',
  },
  {
    code: 'BER3',
    state: 'Brieselang',
    address: 'Germany Gmbh  Havellandstra?e 5',
    postCode: '14656',
    countryCode: 'DE',
  },
  {
    code: 'CGN1-1',
    state: 'Kobern-Gondorf',
    address: 'Amazonstrasse 1',
    postCode: '56330',
    countryCode: 'DE',
  },
  {
    code: 'DUS2',
    state: 'Rheinberg',
    address: 'Amazonstrasse 1',
    postCode: '47495',
    countryCode: 'DE',
  },
  {
    code: 'EDE4',
    state: 'Werne',
    address: 'Werne Wahrbrink 25',
    postCode: '59368',
    countryCode: 'DE',
  },
  {
    code: 'FRA1',
    state: 'Bad Herfeld',
    address: 'FRA1 Am Schlo  Eichhof 1',
    postCode: '36251',
    countryCode: 'DE',
  },
  {
    code: 'FRA3',
    state: 'Bad Herfeld',
    address: 'Amazonstrasse 1',
    postCode: '36251',
    countryCode: 'DE',
  },
  {
    code: 'LEJ1',
    state: 'Leipzig',
    address: 'Amazonstrasse 1',
    postCode: '04347',
    countryCode: 'DE',
  },
  {
    code: 'MUC3-1',
    state: 'Graben',
    address: 'Amazonstra?e 1 /Zeppelinstra?e 2',
    postCode: '86835',
    countryCode: 'DE',
  },
  {
    code: 'MUC3',
    state: 'Graben',
    address: 'Amazonstrasse 1',
    postCode: '86836',
    countryCode: 'DE',
  },
  {
    code: 'PRG2-2',
    state: 'Oranienburg',
    address: 'c/o Amazon FC PRG2  Am Wald 1',
    postCode: '16515',
    countryCode: 'DE',
  },
  {
    code: 'STR1',
    state: 'Pforzheim',
    address: 'Amazonstrasse 1',
    postCode: '75177',
    countryCode: 'DE',
  },
  {
    code: 'WRO2-2',
    state: 'Oranienburg',
    address: 'c/o Amazon FC WRO2  Am Wald 1',
    postCode: '16515',
    countryCode: 'DE',
  },
  {
    code: 'HAM2',
    state: 'Winsen an der Luhe',
    address: 'Borgwardstrasse 10Winsen an der Luhe',
    postCode: '21423',
    countryCode: 'DE',
  },
  {
    code: 'DTM2-1',
    state: 'Dortmund',
    address: 'Kaltbandstrasse 4,  44145 Dortmund',
    postCode: '44145',
    countryCode: 'DE',
  },
  {
    code: 'FRA7',
    state: 'Frankenthal',
    address: 'Am Römig 5',
    postCode: '67227',
    countryCode: 'DE',
  },
  {
    code: 'WRO1',
    state: 'Nürnberg',
    address: 'Hamburger Str. 99',
    postCode: '90451',
    countryCode: 'DE',
  },
  {
    code: 'DTM1',
    state: 'Werne',
    address: 'Raiffeisenstrasse 7Amazon Logistik Werne GmbH',
    postCode: '59368',
    countryCode: 'DE',
  },
  {
    code: 'EDEA',
    state: 'Dortmund',
    address: 'Warmbreitbandstr. 3',
    postCode: '44145',
    countryCode: 'DE',
  },
  {
    code: 'DUS4',
    state: 'Monchengladbach',
    address: 'Hamburgring 10Rheindahlen',
    postCode: '41179',
    countryCode: 'DE',
  },
  { code: 'WRO5', state: 'Halle/Saale', address: 'WRO5', postCode: '06126', countryCode: 'DE' },
  {
    code: 'KTW1-1',
    state: 'Nuernberg',
    address: 'Hamburger Str. 99',
    postCode: '90451',
    countryCode: 'DE',
  },
  {
    code: 'XWR3',
    state: 'Nuernberg',
    address: 'Hamburger Str. 99',
    postCode: '90451',
    countryCode: 'DE',
  },
  {
    code: 'POZ1',
    state: 'Nuernberg',
    address: 'Hamburger Str. 99',
    postCode: '90451',
    countryCode: 'DE',
  },
  {
    code: 'LCJ2',
    state: 'Nuernberg',
    address: 'Hamburger Str 99',
    postCode: '90451',
    countryCode: 'DE',
  },
  {
    code: 'PDEF',
    state: 'Schwarzenbruck',
    address: 'Daimler Strasse 8',
    postCode: '90592',
    countryCode: 'DE',
  },
  {
    code: 'LEJ1-1',
    state: 'Dortmund',
    address: 'AMAZONSTRASSE 1Leipzig,Saxony',
    postCode: '04347',
    countryCode: 'DE',
  },
  { code: 'PAD1', state: 'Oelde', address: 'Aurea 10', postCode: '59302', countryCode: 'DE' },
  {
    code: 'LEJ1-2',
    state: 'Leipzig',
    address: 'AMAZONSTRASSE 1',
    postCode: '04347',
    countryCode: 'DE',
  },
  {
    code: 'DTM2',
    state: 'Suelzetal',
    address: 'c/o Amazon FC WRO5 Lange Goehren160',
    postCode: '39171',
    countryCode: 'DE',
  },
  {
    code: 'POZ1-1',
    state: 'Suelzetal',
    address: 'Lange Goehren 200',
    postCode: '39171',
    countryCode: 'DE',
  },
  {
    code: 'LEJ3',
    state: 'Sulzetal',
    address: 'Bielefelder Str. 9',
    postCode: '39171',
    countryCode: 'DE',
  },
  {
    code: 'XFR1',
    state: 'Hammersbach',
    address: 'Zum Haarstrauch 9-15',
    postCode: '63546',
    countryCode: 'DE',
  },
  {
    code: 'XWR1',
    state: 'Nuernberg',
    address: 'Hamburger Str. 99',
    postCode: '90451',
    countryCode: 'DE',
  },
  {
    code: 'LCJ4',
    state: 'Nuernberg',
    address: 'Hamburger Str99',
    postCode: '90451',
    countryCode: 'DE',
  },
  { code: 'XDU1', state: 'Malsfeld', address: 'Bornwiese 1', postCode: '34323', countryCode: 'DE' },
  {
    code: 'XPO1',
    state: 'Nuernburg',
    address: 'Hamburger Str. 99',
    postCode: '90451',
    countryCode: 'DE',
  },
  {
    code: 'LCJ3',
    state: 'Nuernburg',
    address: 'Hamburger Str. 99',
    postCode: '90451',
    countryCode: 'DE',
  },
  {
    code: 'XFR2',
    state: 'Zehnhausen bei Rennerod',
    address: 'Amazon Fulfillment Center',
    postCode: '56477',
    countryCode: 'DE',
  },
  {
    code: 'BRE4',
    state: 'Achim',
    address: 'Amazon Logistik Achim GmbH(BRE4)',
    postCode: '28832',
    countryCode: 'DE',
  },
  {
    code: 'XDU2',
    state: 'Oberhausen',
    address: 'Amazon Fulfillment Center XDU2',
    postCode: '46147',
    countryCode: 'DE',
  },
  {
    code: 'NUE1',
    state: 'Gattendorf',
    address: 'Amazonstraße 1',
    postCode: '95185',
    countryCode: 'DE',
  },
  {
    code: 'XSC1',
    state: 'Kaiserslautern',
    address: 'Amazon Fulfillment Center',
    postCode: '67661',
    countryCode: 'DE',
  },
  {
    code: 'BER8',
    state: 'Schönefeld',
    address: 'BER8/IXD1 Amazon Verteilzentrum',
    postCode: '12529',
    countryCode: 'DE',
  },
  {
    code: 'XDEA',
    state: 'Koenigs Wusterhausen',
    address: 'Amazon Fulfillment Center (XDEA)',
    postCode: '15713',
    countryCode: 'DE',
  },
  {
    code: 'LEJ5',
    state: 'Gera',
    address: 'Am Steingarten 2',
    postCode: '07554',
    countryCode: 'DE',
  },
  {
    code: 'MAD4',
    state: 'Madrid',
    address: 'Avenida de la Astronomia24 San Fernando de Henares',
    postCode: '28830',
    countryCode: 'ES',
  },
  {
    code: 'XESB',
    state: 'Alovera',
    address: 'Avenida Rio Henares 16',
    postCode: '19208',
    countryCode: 'ES',
  },
  {
    code: 'XESA',
    state: 'Alovera',
    address: '16 ND LogisticsAvenida Rio Henares,',
    postCode: '19208',
    countryCode: 'ES',
  },
  {
    code: 'BCN1',
    state: 'Barcelona',
    address: '6-8 El Prat de LlobregatAv. de les Garrigues num.',
    postCode: '08820',
    countryCode: 'ES',
  },
  {
    code: 'BCN2',
    state: 'Barcelona',
    address: 'Carrer de la VERNEDA 22MARTORELLES',
    postCode: '08107',
    countryCode: 'ES',
  },
  {
    code: 'MAD6',
    state: 'Illescas',
    address: 'Carretera antigua Madrid-Toledo 38D',
    postCode: '45200',
    countryCode: 'ES',
  },
  {
    code: 'BCN3',
    state: 'Barcelona',
    address: 'Carrer Ferro 12',
    postCode: '08755',
    countryCode: 'ES',
  },
  {
    code: 'MAD4-1',
    state: 'Madrid',
    address: '24 San Fernando de HenaresAvenida de la Astronomia',
    postCode: '28830',
    countryCode: 'ES',
  },
  {
    code: 'SVQ1',
    state: 'Seville',
    address: 'Bulevar Agustín Nuñez Llanos s/nPoligono La Isla, Dos Hermanas',
    postCode: '41703',
    countryCode: 'ES',
  },
  {
    code: 'MAD9',
    state: 'Alcala de Henares',
    address: 'Camino de los Afligidos',
    postCode: '28805',
    countryCode: 'ES',
  },
  {
    code: 'AMZAFCBCN2',
    state: 'Lahr',
    address: 'Dr. Georg-Schaeffler-Strasse 765',
    postCode: '77933',
    countryCode: 'ES',
  },
  {
    code: 'RMU1',
    state: 'Murcia',
    address: 'Calle Isidro Vivancos Munoz',
    postCode: '30156',
    countryCode: 'ES',
  },
  {
    code: 'ZAZ1',
    state: 'Zaragoza',
    address: 'ALI-28 y ALI-2',
    postCode: '50197',
    countryCode: 'ES',
  },
  {
    code: 'BCN8',
    state: 'Sabadell Barcelona',
    address: 'Amazon Fulfillment Center BCN8/IBC2',
    postCode: '08210',
    countryCode: 'ES',
  },
  {
    code: 'LYS1-2',
    state: 'Severy',
    address: '1 Rue AmazonDistripole Chalon ZAC Parc Activite',
    postCode: '71100',
    countryCode: 'FR',
  },
  {
    code: 'ORY1-2',
    state: 'Saran',
    address: '1401 Rue Du Champ Rouge',
    postCode: '45770',
    countryCode: 'FR',
  },
  {
    code: 'XFRG',
    state: 'Moulin',
    address: 'XPO Artenay NS 3PL ZAC du',
    postCode: '45410',
    countryCode: 'FR',
  },
  {
    code: 'ORY1-1',
    state: 'SARAN',
    address: 'Pole 451401 rue du Champ Rouge',
    postCode: '45772',
    countryCode: 'FR',
  },
  {
    code: 'BVA1',
    state: 'AMIENS CEDEX',
    address: 'Avenue du Superbe Orenoque',
    postCode: '80337',
    countryCode: 'FR',
  },
  {
    code: 'MRS1-2',
    state: 'Montelimar',
    address: 'ZAC Les Portes de ProvenceBuilding II',
    postCode: '26200',
    countryCode: 'FR',
  },
  {
    code: 'LIL1-1',
    state: 'LAUWIN PLANQUE',
    address: '1, Rue Amazon',
    postCode: '59353',
    countryCode: 'FR',
  },
  {
    code: 'MRS1-1',
    state: 'MONTELIMAR CEDEX',
    address: 'Building II ZAC lesPortes de Provence',
    postCode: '26132',
    countryCode: 'FR',
  },
  {
    code: 'LYS1-1',
    state: 'SEVREY CEDEX',
    address: 'Distripôle ChâlonsZAC Val de Bourgogne',
    postCode: '71311',
    countryCode: 'FR',
  },
  {
    code: 'ORY4-1',
    state: 'CEDEX',
    address: '20 AVENUE DU CENTRE DSSAI EN VOLBRETIGNY SUR ORGE',
    postCode: '91225',
    countryCode: 'FR',
  },
  {
    code: 'LIL1',
    state: 'LAUWIN PLANQUE',
    address: '1, Rue Amazon',
    postCode: '59553',
    countryCode: 'FR',
  },
  {
    code: 'ORY1',
    state: 'SARAN',
    address: 'Pole 45 1401 rue du Champ RougeSARAN CEDEX 45772',
    postCode: '45772',
    countryCode: 'FR',
  },
  {
    code: 'ORY4-3',
    state: 'BRETIGNY SUR ORGE',
    address: '20 AVENUE DU CENTRE DESSAI ENVOLBRETIGNY SUR ORGE CEDEX',
    postCode: '91225',
    countryCode: 'FR',
  },
  {
    code: 'BAV1-1',
    state: 'Boves',
    address: 'Avenue du Superbe OrenoqHauts-de-France',
    postCode: '80337',
    countryCode: 'FR',
  },
  {
    code: 'ORY4',
    state: 'BRETIGNY SUR',
    address: '20 AVENUE DU CENTRE D’ESSAI EN VOL',
    postCode: '26132',
    countryCode: 'FR',
  },
  {
    code: 'LIL1-2',
    state: 'LAUWIN PLANQUE',
    address: '1, Rue Amazon',
    postCode: '59553',
    countryCode: 'FR',
  },
  {
    code: 'LIL1-3',
    state: '(PC)',
    address: 'Strada Dogana Po, 2UCastel San Giovanni',
    postCode: '59553',
    countryCode: 'FR',
  },
  {
    code: 'CDG7',
    state: 'Senlis CEDEX',
    address: "Parc d'activites des Portes de Senl1 avenue Alain Boucher",
    postCode: '60452',
    countryCode: 'FR',
  },
  {
    code: 'VESK',
    state: 'Savigny le Temple',
    address: '7 rue du Chrome',
    postCode: '77176',
    countryCode: 'FR',
  },
  {
    code: 'XOR1',
    state: 'Corbeil',
    address: 'Piece de la Remise 146,route de',
    postCode: '91090',
    countryCode: 'FR',
  },
  {
    code: 'AMZAFCCDG7',
    state: 'Lahr',
    address: 'Dr. Georg-Schaeffler-Strasse',
    postCode: '77933',
    countryCode: 'FR',
  },
  {
    code: 'BHX1',
    state: 'Rugeley',
    address: 'Towers Business ParkPower Station Road Rugeley',
    postCode: 'WS15 1LX',
    countryCode: 'GB',
  },
  {
    code: 'CWL1-1',
    state: 'Swansea',
    address: 'Ffordd Amazon Crymlyn Burrows ,1',
    postCode: 'SA1 8QX',
    countryCode: 'GB',
  },
  {
    code: 'EDI4',
    state: 'Dunfermline',
    address: 'Amazon Fulfilment Centre Amazon Way',
    postCode: 'KY11 8ST',
    countryCode: 'GB',
  },
  {
    code: 'EUK5',
    state: 'Peterborough',
    address: 'Phase Two, 1Kingston Park Flaxley Road',
    postCode: 'PE2 9EN',
    countryCode: 'GB',
  },
  {
    code: 'GLA1',
    state: 'Gourock',
    address: '2 Cloch Road Faulds Park',
    postCode: 'PA19 1BQ',
    countryCode: 'GB',
  },
  {
    code: 'LBA1',
    state: 'Doncaster',
    address: 'Limited Unit 1 Balby Carr bank',
    postCode: 'DN4 5JS',
    countryCode: 'GB',
  },
  {
    code: 'LTN1',
    state: 'Ridgmont',
    address: 'Marston Gate Fulfillment Centre ,1',
    postCode: 'MK43 0ZA',
    countryCode: 'GB',
  },
  {
    code: 'LTN2',
    state: 'Hemel Hempstead',
    address: 'Boundary Way ,1',
    postCode: 'HP 27LF',
    countryCode: 'GB',
  },
  {
    code: 'LTN4',
    state: 'Dunstable',
    address: 'Unit DC1 (Prologis)',
    postCode: 'LU54FE',
    countryCode: 'GB',
  },
  {
    code: 'MAN1',
    state: 'Manchester',
    address: '6 Sunbank Lane  Altringham,',
    postCode: 'M90 5AA',
    countryCode: 'GB',
  },
  {
    code: 'XUKD',
    state: 'DAVENTRY',
    address: 'Unit C Daventry Distribution CentreRoyal Oak Way North',
    postCode: 'NN11 8QL',
    countryCode: 'GB',
  },
  {
    code: 'BHX2',
    state: 'COALVILLE',
    address: '15B Beveridge LnEllistown',
    postCode: 'LE67 1FB',
    countryCode: 'GB',
  },
  {
    code: 'LBA2',
    state: 'Doncaster',
    address: 'Unit 1 (IP1= Amazon) Iport Avenue',
    postCode: 'DN11 0BG',
    countryCode: 'GB',
  },
  {
    code: 'MAN2',
    state: 'Warrington',
    address: 'Omega Plot 7c Orion BoulevardOrion BoulvardGreat Sankey',
    postCode: 'WA5 3XA',
    countryCode: 'GB',
  },
  {
    code: 'LCY2',
    state: 'Tilbury',
    address: 'Amazon Distribution Depot Unit 2,London Distribution Park',
    postCode: 'RM18 7AN',
    countryCode: 'GB',
  },
  {
    code: 'BHX4-3',
    state: 'COVENTRY',
    address: 'Coundon Wedge Drive, Lyons Park,',
    postCode: 'CV5 9DQ',
    countryCode: 'GB',
  },
  {
    code: 'MAN3',
    state: 'Bolton',
    address: '360 Logistics North',
    postCode: 'BL5 1EE',
    countryCode: 'GB',
  },
  {
    code: 'EUKD',
    state: 'WIDNES',
    address: 'Foundry Point,HalebankIndustrial Estate,Foundry Lane',
    postCode: 'WA8 8YN',
    countryCode: 'GB',
  },
  {
    code: 'EUKB',
    state: 'Peterborough',
    address: 'Unit 12,Overton Park,Holkham Road',
    postCode: 'PE2 6TE',
    countryCode: 'GB',
  },
  {
    code: 'XBH1',
    state: 'Daventry',
    address: 'Royal Oak Way NorthUnit A Daventry Distribution Centre',
    postCode: 'NN11 8LR',
    countryCode: 'GB',
  },
  {
    code: 'BHX4-2',
    state: 'COVENTRY',
    address: 'Coundon Wedge Drive, Lyons Park,',
    postCode: 'CV5 9FA',
    countryCode: 'GB',
  },
  {
    code: 'XUKK',
    state: 'Birmingham',
    address: 'K&N Birmingham NS 3PLMerlin Park II  Wood Lane',
    postCode: 'B24 9QJ',
    countryCode: 'GB',
  },
  {
    code: 'SUUK',
    state: 'Greater London',
    address: 'Principal Place, Amazon UK115 Worship Street  London',
    postCode: 'EC2A 2BA',
    countryCode: 'GB',
  },
  {
    code: 'EUKA',
    state: 'Southgate',
    address: 'Units 9 – 10 Manasty Rd Orton',
    postCode: 'PE2 6UG',
    countryCode: 'GB',
  },
  {
    code: 'BHX3',
    state: 'Daventry',
    address: '4 Royal Oak Way North DaventryNorthamptonshire',
    postCode: 'NN11 8QL',
    countryCode: 'GB',
  },
  {
    code: 'BRS1',
    state: 'Bristol',
    address: 'Amazon BRS1 Fulfillment CenterGoldcrest Way',
    postCode: 'BS35 4DJ',
    countryCode: 'GB',
  },
  {
    code: 'EMA1',
    state: 'Derby',
    address: 'Unit 1, Wilders Way',
    postCode: 'DE74 2BB',
    countryCode: 'GB',
  },
  {
    code: 'MAN4',
    state: 'CHESTERFIELD',
    address: '29 Gander Lane',
    postCode: 'S43 4PZ',
    countryCode: 'GB',
  },
  { code: 'BHX5', state: 'Rugby', address: 'Unit 3', postCode: 'CV23 0XF', countryCode: 'GB' },
  {
    code: 'BHX4-1',
    state: 'COVENTRY',
    address: 'Plot 1, Lyons ParkLyons Dr',
    postCode: 'CV5 9PF',
    countryCode: 'GB',
  },
  {
    code: 'LTN4-1',
    state: 'Dunstable',
    address: 'Unit DC1 (Prologis)Boscombe Road',
    postCode: 'LU54TT',
    countryCode: 'GB',
  },
  {
    code: 'XUKD',
    state: 'Daventry',
    address: 'XPO LogisticsUnit A Daventry Distribution Centre',
    postCode: 'NN11 8LR',
    countryCode: 'GB',
  },
  {
    code: 'MME1',
    state: 'Darlington',
    address: 'Building One Symmetry Park',
    postCode: 'DL1 4BF',
    countryCode: 'GB',
  },
  {
    code: 'LTN2',
    state: 'Hemel Hempstead',
    address: 'Boundary Way',
    postCode: 'HP2 7UJ',
    countryCode: 'GB',
  },
  {
    code: 'CWL1-2',
    state: 'Wales',
    address: 'FFORDD AMAZON, SWANSEA',
    postCode: 'SA1 8QX',
    countryCode: 'GB',
  },
  {
    code: 'LBA2-1',
    state: 'Yorkshire',
    address: 'Unit 1(IP1= Amazon), Doncaster',
    postCode: 'DN11 0BG',
    countryCode: 'GB',
  },
  {
    code: 'MAN1-1',
    state: 'Manchester',
    address: '6 Sunbank Lane Airport CityAltrincham,',
    postCode: 'M90 5AA',
    countryCode: 'GB',
  },
  {
    code: 'EUK5-1',
    state: 'Peterborough',
    address: 'Amazon Fulfillment Center Phase TwoKingston Park Flaxley Road',
    postCode: 'PE2 9EN',
    countryCode: 'GB',
  },
  {
    code: 'EDI4-1',
    state: 'Dunfermline',
    address: 'Amazon WayDunfermline',
    postCode: 'KY11 8ST',
    countryCode: 'GB',
  },
  {
    code: 'LTN1-1',
    state: 'Ridgmont',
    address: 'Marston Gate Fulfillment Centre',
    postCode: 'MK43 0ZA',
    countryCode: 'GB',
  },
  {
    code: 'LTN9',
    state: 'DUNSTABLE',
    address: 'UNITS DC1 AND DC2 PROLOGISBOSCOMBE ROAD',
    postCode: 'LU5 4FE',
    countryCode: 'GB',
  },
  {
    code: 'MAN2-1',
    state: 'Warrington',
    address: 'Omega Plot 7c  Orion BoulevardWarrington, North West England',
    postCode: 'WA5 3XA',
    countryCode: 'GB',
  },
  {
    code: 'MME2',
    state: 'BOWBURN',
    address: 'Amazon Fulfillment CenterPEAT EDGE FARM TURSDALE ROAD',
    postCode: 'DH6 5NP',
    countryCode: 'GB',
  },
  {
    code: 'LBA4',
    state: 'DONCASTER',
    address: 'Toronto Way DONCASTER',
    postCode: 'DN11 0PU',
    countryCode: 'GB',
  },
  {
    code: 'XBH2',
    state: 'Warwickshire',
    address: 'DC1 Pro Logis, Central Park  RUGBY',
    postCode: 'CV23 0WB',
    countryCode: 'GB',
  },
  {
    code: 'EMA2',
    state: 'SUTTON IN ASHFIELD',
    address: 'SUMMIT PARK  SHERWOOD WAY SOUTH',
    postCode: 'NG17 5NB',
    countryCode: 'GB',
  },
  {
    code: 'LTN9-1',
    state: 'DUNSTABLE',
    address: 'UNIT DC2 PROLOGIS BOSCOMBEROADDUNSTABLEDUNSTABLE',
    postCode: 'LU5 4FE',
    countryCode: 'GB',
  },
  {
    code: 'EMA2-1',
    state: 'SUTTON IN ASHFIELD',
    address: 'SUMMIT PARKSHERWOOD WAY SOUTH',
    postCode: 'NG17 4PA',
    countryCode: 'GB',
  },
  {
    code: 'MXP5',
    state: 'Castel San Giovanni (PC)',
    address: 'Strada Dogana Po, 2U',
    postCode: '29015',
    countryCode: 'IT',
  },
  {
    code: 'FCO1',
    state: 'Passo Corese RI',
    address: 'Via della Meccanica snc ,1',
    postCode: '02032',
    countryCode: 'IT',
  },
  {
    code: 'MXP3',
    state: 'Vercelli',
    address: 'Via Rita Levi Montalcini 2',
    postCode: '13100',
    countryCode: 'IT',
  },
  {
    code: 'TRN1',
    state: 'Torrazza Piemonte',
    address: 'Strada Provinciale perRondissone 90',
    postCode: '10037',
    countryCode: 'IT',
  },
  {
    code: 'XMP1',
    state: 'Arqua Polesine',
    address: 'Via Maestri Del Lavoro, 990',
    postCode: '45031',
    countryCode: 'IT',
  },
  {
    code: 'XMP2',
    state: 'Francolino',
    address: 'Via Aldo Moro 4',
    postCode: '20080',
    countryCode: 'IT',
  },
  {
    code: 'MXP5-1',
    state: 'Castel San Giovanni (PC)',
    address: 'Strada Dogana Po, 2U',
    postCode: '29015',
    countryCode: 'IT',
  },
  {
    code: 'BLQ1',
    state: 'San Bellino  Rovigo',
    address: 'Via Ipazia D’Alessandria 946',
    postCode: '45020',
    countryCode: 'IT',
  },
  {
    code: 'FCO2',
    state: 'Rome',
    address: 'Via Palianese  Colleferro',
    postCode: '00034',
    countryCode: 'IT',
  },
  {
    code: 'VEII',
    state: 'Piacenza',
    address: 'Strada della Torre della Razza, 62',
    postCode: '29100',
    countryCode: 'IT',
  },
  {
    code: 'AMZAFCMXP5',
    state: 'Günzburg',
    address: 'Ferdinand-Porsche-Strasse 250',
    postCode: '89312',
    countryCode: 'IT',
  },
  {
    code: 'BGY1',
    state: 'Cividate al Piano',
    address: 'Via Primo Maggio 8',
    postCode: '24050',
    countryCode: 'IT',
  },
  {
    code: 'PSR2',
    state: 'San Salvo',
    address: 'Viale Germania, 29',
    postCode: '66050',
    countryCode: 'IT',
  },
  {
    code: 'MXP6',
    state: 'AGOGNATE, NOVARA',
    address: 'Strada Provinciale  299 sncStrada Provinciale  299',
    postCode: '28100',
    countryCode: 'IT',
  },
  {
    code: 'BLQ8',
    state: 'Spilamberto Modena',
    address: 'Via Pelloni 5',
    postCode: '41057',
    countryCode: 'IT',
  },
  {
    code: 'WRO5-1',
    state: 'Okmiany',
    address: 'Okmiany Chojnow OkmianyDolnoslaskie voivodeship',
    postCode: '59225',
    countryCode: 'PL',
  },
  {
    code: 'KTW1',
    state: 'Silesian',
    address: '19, Inwestycyjna Street Sosnowiec',
    postCode: '41208',
    countryCode: 'PL',
  },
  {
    code: 'SZZ1',
    state: 'Kołbaskowo',
    address: 'Kołbaskowo 156',
    postCode: '72-001',
    countryCode: 'PL',
  },
  { code: 'KTW3', state: 'Gliwice', address: '80 Bojkowska', postCode: '44141', countryCode: 'PL' },
  {
    code: 'LCJ-2',
    state: 'Pawlikowice',
    address: 'Pawlikowice 155 Pabianice',
    postCode: '95-200',
    countryCode: 'PL',
  },
  {
    code: 'LCJ4-1',
    state: 'Lodz',
    address: 'sp. z o.o.Zagloby Lodz Lodz',
    postCode: '90001',
    countryCode: 'PL',
  },
  {
    code: 'WRO2',
    state: 'Bielany Wroclawskie,',
    address: 'ul. Logistyczna 6(WRO2)',
    postCode: '55-040',
    countryCode: 'PL',
  },
  {
    code: 'PRG2',
    state: 'Dobrovíz',
    address: 'Amazon Fulfillment Poland sp. z o.o(POZ1)',
    postCode: '252 61',
    countryCode: 'PL',
  },
  {
    code: 'POZ1-PL',
    state: 'Sady',
    address: 'ul. Poznanska 1d',
    postCode: '62-080',
    countryCode: 'PL',
  },
  {
    code: 'POZ2',
    state: 'Chociule',
    address: 'Chociule 100',
    postCode: '66-200',
    countryCode: 'PL',
  },
  {
    code: 'WRO5-PL',
    state: 'Okmiany',
    address: 'Amazon Fulfillment sp. z o.o-WRO5',
    postCode: '59-225',
    countryCode: 'PL',
  },
  {
    code: 'MEM1',
    state: 'TN',
    address: '3292 E Holmes Rd Memphis',
    postCode: '38118-8102',
    countryCode: 'US',
  },
];

export const fbaDict = keyBy(fbaCode, 'code');
export const formFieldFBACodeSelection: FormField = {
  label: 'FBA Code',
  field: 'fbaCode',
  component: 'NSelect',
  componentProps: {
    options: fbaCode.map((it) => ({
      label: it.code + '(' + it.countryCode + ')',
      value: it.code,
    })),
  },
  displayCondition(value) {
    return value['addressType'] == AddressType.AMZ;
  },
};

export function generateFbaAddress(fbaObj: FBAAddress) {
  return `${fbaObj.address}
${fbaObj.state} ${fbaObj.postCode}
${fbaObj.countryCode}
`;
}
