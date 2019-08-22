import bcrypt from "bcrypt";
import {
    AllowNull,
    BeforeCreate, BeforeUpdate,
    Column,
    DataType,
    Default,
    Is,
    IsUUID,
    Model,
    PrimaryKey,
    Table, Unique
} from "sequelize-typescript";

const NAME_REGEX = /^[a-zàâéèëêïîôùüçœ\'’ -]+$/i;

@Table({
    tableName: "Users",
    timestamps: true
})
export default class User extends Model<User> {
    @IsUUID(4)
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    public id: string;

    @Is(NAME_REGEX)
    @Column
    public firstName: string;

    @Is(NAME_REGEX)
    @Column
    public lastName: string;

    @AllowNull(false)
    @Column
    public password: string;

    @Unique
    @AllowNull(false)
    @Column
    public email: string;

    @Unique
    @AllowNull(true)
    @Column
    public phone: string|null;

    @BeforeCreate
    @BeforeUpdate
    public static async hashPassword(instance: User) {
        if (instance.changed("password")) {
            instance.password = await bcrypt.hash(instance.password, 10);
        }
    }

    public isPasswordMatching(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}