import {
    AllowNull,
    BeforeCreate,
    BeforeUpdate,
    Column,
    DataType,
    Default,
    Is,
    IsEmail,
    IsUUID,
    Model,
    PrimaryKey,
    Table,
    Unique
} from "sequelize-typescript";

import bcrypt from "bcrypt-nodejs";

const NAME_REGEX = /^[a-zàâéèëêïîôùüçœ\'’ -]+$/i;

@Table({
    tableName: "Users",
    timestamps: true
})
export default class UserModel extends Model<UserModel> {
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
    @IsEmail
    @Column
    public email: string;

    @AllowNull(false)
    @Column
    public password: string;

    @Unique
    @Column
    public phone: string;

    @Default(false)
    @Column
    public validated: boolean;

    @BeforeCreate
    @BeforeUpdate
    public static async hashPassword(user: UserModel) {
        if (user.changed("password")) {
            await bcrypt.hash(user.password, null, null, (err, hash) => {
                user.password = hash;
            });
        }
    }

    async comparePasswords(pass: string): Promise<boolean> {
        return bcrypt.compare(pass, this.password, (res) => {
            console.log(res);
            return res
        });
    }
}
