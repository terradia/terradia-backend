import { gql } from "apollo-server";

export default gql`
  input ScheduleInput {
    startTime: Date!
    endTime: Date!
  }

  input CompanyUpdateInput {
    name: String
    officialName: String
    description: String
    email: String
    phone: String
    address: String
    siren: String
    logoId: String
    coverId: String
    firstname: String
    lastname: String
    year: String
    month: String
  }

  type CompanyAddress {
    complementAdresseEtablissement: String
    numeroVoieEtablissement: String
    indiceRepetitionEtablissement: String
    typeVoieEtablissement: String
    libelleVoieEtablissement: String
    codePostalEtablissement: String
    libelleCommuneEtablissement: String
    libelleCommuneEtrangerEtablissement: String
    distributionSpecialeEtablissement: String
    codeCommuneEtablissement: String
    codeCedexEtablissement: String
    libelleCedexEtablissement: String
    codePaysEtrangerEtablissement: String
    libellePaysEtrangerEtablissement: String
  }

  type LegalUnits {
    statutDiffusionUniteLegale: String
    unitePurgeeUniteLegale: Boolean
    dateCreationUniteLegale: String
    sigleUniteLegale: String
    sexeUniteLegale: String
    prenom1UniteLegale: String
    prenom2UniteLegale: String
    prenom3UniteLegale: String
    prenom4UniteLegale: String
    prenomUsuelUniteLegale: String
    pseudonymeUniteLegale: String
    identifiantAssociationUniteLegale: String
    trancheEffectifsUniteLegale: String
    anneeEffectifsUniteLegale: String
    dateDernierTraitementUniteLegale: String
    nombrePeriodesUniteLegale: Int
    categorieEntreprise: String
    anneeCategorieEntreprise: String
    etatAdministratifUniteLegale: String
    nomUniteLegale: String
    denominationUniteLegale: String
    denominationUsuelle1UniteLegale: String
    denominationUsuelle2UniteLegale: String
    denominationUsuelle3UniteLegale: String
    activitePrincipaleUniteLegale: String
    categorieJuridiqueUniteLegale: String
    nicSiegeUniteLegale: String
    nomenclatureActivitePrincipaleUniteLegale: String
    nomUsageUniteLegale: String
    economieSocialeSolidaireUniteLegale: String
    caractereEmployeurUniteLegale: String
  }

  type CompanyDates {
    dateFin: String
    dateDebut: String
    etatAdministratifEtablissement: String
    changementEtatAdministratifEtablissement: Boolean
    enseigne1Etablissement: String
    enseigne2Etablissement: String
    enseigne3Etablissement: String
    changementEnseigneEtablissement: Boolean
    denominationUsuelleEtablissement: String
    changementDenominationUsuelleEtablissement: Boolean
    activitePrincipaleEtablissement: String
    nomenclatureActivitePrincipaleEtablissement: String
    changementActivitePrincipaleEtablissement: Boolean
    caractereEmployeurEtablissement: String
    changementCaractereEmployeurEtablissement: Boolean
  }

  type CompanyInfo {
    score: Int
    siren: String
    nic: String
    siret: String
    statutDiffusionEtablissement: String
    dateCreationEtablissement: String
    trancheEffectifsEtablissement: String
    anneeEffectifsEtablissement: String
    activitePrincipaleRegistreMetiersEtablissement: String
    dateDernierTraitementEtablissement: String
    etablissementSiege: Boolean
    nombrePeriodesEtablissement: Int
    uniteLegale: LegalUnits
    adresseEtablissement: CompanyAddress
    adresse2Etablissement: CompanyAddress
    periodesEtablissement: CompanyDates
  }

  extend type Query {
    getAllCompanies(page: Int, pageSize: Int): [Company]
    getCompany(companyId: ID!): Company
    getCompanyByName(name: String!): Company
    getCompaniesByDistance(
      page: Int
      pageSize: Int
      lat: Float!
      lon: Float!
    ): [Company]
    getCompaniesByDistanceByCustomer(page: Int, pageSize: Int): [Company]
    getCompaniesByUser(userId: ID!): [CompanyUser]
    getCompanies: [Company]
    searchCompanies(query: String!): [Company]
    checkSiren(siren: String!): CompanyInfo
  }

  extend type Mutation {
    createCompany(
      name: String!
      description: String
      email: String!
      phone: String!
      address: String!
      siren: String!
    ): Company!
    deleteCompany(companyId: String!): Company!
    updateCompany(companyId: ID!, newValues: CompanyUpdateInput): Company!
    joinCompany(companyId: String!, userId: String!): Company!
    leaveCompany(companyId: String!, userId: String!): Company!
    restoreCompany(companyId: String!): Company!
  }

  type Company {
    # Resource related information
    id: ID!
    name: String!
    officialName: String
    description: String
    email: String!
    phone: String!
    siren: String!
    logo: CompanyImage
    cover: CompanyImage
    createdAt: Date
    updatedAt: Date
    archivedAt: Date
    companyImages: [CompanyImage]
    # Products related data
    products: [Product]
    productsCategories: [CompanyProductsCategory]

    # Geolocalization
    address: String!
    geoPosition: GeographicPoint
    distance: Float # field added when returning the data form the resolvers
    # Users
    users: [CompanyUser]

    # Customers
    customerCarts: [Cart]
    averageMark: Float
    numberOfMarks: Int
    reviews: [CompanyReview]

    tags: [CompanyTag]

    # Opening Hours
    openingDays: [CompanyOpeningDay]
    deliveryDays: [CompanyDeliveryDay]
  }
  type GeographicPoint {
    coordinates: [Float]
  }
`;
